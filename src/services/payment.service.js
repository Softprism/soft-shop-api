import axios from "axios";
import dotenv from "dotenv";
import forge from "node-forge";
import Flutterwave from "flutterwave-node-v3";

import User from "../models/user.model";
import Order from "../models/order.model";
import Store from "../models/store.model";
import Ledger from "../models/ledger.model";

import {
  sendStoreNewOrderSentMail, sendStorePayoutSentMail, sendUserNewOrderPaymentFailedMail, sendUserNewOrderSentMail
} from "../utils/sendMail";

import { createTransaction } from "./transaction.service";
import { sendMany } from "./push.service";
import Transaction from "../models/transaction.model";

// initial env variables
dotenv.config();

// initialize flutterwave
const {
  FLUTTERWAVE_SECRET_KEY_LIVE, FLUTTERWAVE_PUBLIC_KEY_LIVE
} = process.env;
const flw = new Flutterwave(FLUTTERWAVE_PUBLIC_KEY_LIVE, FLUTTERWAVE_SECRET_KEY_LIVE);

const bankTransfer = async (payload) => {
  const response = await flw.Charge.bank_transfer(payload);
  return response;
};
const ussdPayment = async (payload) => {
  const response = await flw.Charge.ussd(payload);
  return response;
};
const cardPayment = async (payload) => {
  const response = flw.Tokenized.charge(payload);
  return response;
};
const verifyTransaction = async (paymentDetails) => {
  // this verifies a transaction with flutterwave
  // if it's a new card transaction, it adds the cards details to the user profile
  // if it's a order transaction, it adds the payment details to the order payment result and credit store balance

  const response = await flw.Transaction.verify({ id: paymentDetails.data.id });
  console.log(response);

  const { tx_ref } = response.data;
  if (tx_ref.includes("card")) {
    // user is adding a new card

    // return an error if response isn't succesful
    if (response.data.status !== "successful") {
      return { err: response.message, status: 400 };
    }

    // check if card has already been added
    let checker = await User.findOne({
      _id: response.data.meta.user_id,
      "cards.first_6digits": response.data.card.first_6digits,
      "cards.last_4digits": response.data.card.last_4digits,
      "cards.token": response.data.card.token
    });
    if (checker) {
      // cancel operation and refund user
      const refund = await flw.Transaction.refund({ id: response.data.id, amount: response.data.amount });
      return { err: "This card has been added already. Transaction would be refunded.", status: 409 };
    }

    // find user from payment initiated
    let user = await User.findById(response.data.meta.user_id).select("-orders");

    // create card index
    let card_index = () => {
      let s4 = () => {
        return Math.floor((1 + Math.random()) * 0x10000)
          .toString(16)
          .substring(1);
      };
        // return id of format 'card - aaaaa'
      return `cindex-${s4()}`;
    };
    // add card index to initiated payment card details
    response.data.card.card_index = card_index();

    // add new card details to user
    user.cards.push(response.data.card);
    await user.save();

    // create credit transaction for Ledger
    let ledger = await Ledger.findOne({});
    let request = {
      amount: 100,
      type: "Credit",
      to: "Ledger",
      receiver: ledger._id,
      status: "completed",
      ref: card_index()
    };
    await createTransaction(request);

    // unset cards
    // user.cards = undefined;
    return user;
  }

  if (tx_ref.includes("soft")) {
    // user is paying for an order

    let order = await Order.findOne({ orderId: tx_ref }).populate("user");
    let user = await User.findById(order.user._id);
    let store = await Store.findById(order.store);
    let ledger = await Ledger.findOne({});

    order.paymentResult = response.data;
    order.markModified("paymentResult");

    // Update order status to sent and credit store balance when payment has been validated by flutterwave. Hitting this endpoint from softshop app will not update details.
    if (response.data.status === "successful" && paymentDetails.softshop !== "true") {
      order.status = "sent";

      // create a credit transaction for store and softshop
      let storeReq = {
        amount: order.subtotal,
        type: "Credit",
        to: "Store",
        receiver: store._id,
        status: "completed",
        ref: order._id
      };
      await createTransaction(storeReq);
      let ledgerReq = {
        amount: order.totalPrice,
        type: "Credit",
        to: "Ledger",
        receiver: ledger._id,
        status: "completed",
        ref: order._id
      };
      await createTransaction(ledgerReq);

      // notify order app on new order
      let data = {
        event: "new_order",
        route: "/",
        index: "0"
      };
      await sendMany(
        "ssa",
        store.orderPushDeviceToken,
        "New Order",
        `You have a new order from ${order.user.first_name} ${order.user.last_name}`,
        data // data to be sent to order app
      );

      // send email to store on new order
      await sendStoreNewOrderSentMail(order.orderId, store.email);

      // send email to user to notify them of sent order
      await sendUserNewOrderSentMail(order.orderId, order.user.email, store.email);

      await store.save();
      await order.save();
      return order;
    }
    if (response.data.status === "failed") {
      // mark order as failed
      // order.status = "cancelled";
      // await order.save();
      // delete order from user orders
      user.orders.pull(order._id);
      await user.save();
      // delete order
      await Order.findOneAndDelete({ orderId: tx_ref });
      // send payment failed email to user
      await sendUserNewOrderPaymentFailedMail(order.orderId, order.user.email);

      return order;
    }
  }
};

const verifyPayout = async (payload) => {
  // check for failed payment and retry

  // else check for successful payment and update transaction status and send appropraite emails

  let flwpayload = {
    id: payload.data.id
  };
  const response = await flw.Transfer.get_a_transfer(flwpayload);

  if (response.data.status === "SUCCESSFUL") {
    let ledger = await Ledger.findOne({});
    let store = await Store.findById(response.data.narration);
    // check for approved store request
    let oldStoreRequest = await Transaction.findOne({
      type: "Debit",
      to: "Store",
      receiver: response.data.narration,
      status: "approved",
    });
    // check for pending store request in ledger
    let oldLedgerRequest = await Transaction.findOne({
      type: "Debit",
      to: "Ledger",
      receiver: ledger._id,
      status: "approved",
      ref: response.data.narration

    });

    if (oldStoreRequest && oldLedgerRequest) {
      // update status of oldStoreRequest and oldLedgerRequest
      oldStoreRequest.status = "completed";
      oldLedgerRequest.status = "completed";

      // update oldStoreRequest and oldLedgerRequest
      await oldStoreRequest.save();
      await oldLedgerRequest.save();

      // change store's pending withdrawal to false
      store.pendingWithdrawal = false;
      store.save();

      // send push notifications to vendor on successful payment
      await sendMany(
        "ssa",
        store.vendorPushDeviceToken,
        "Payout Completed",
        "Your withdrawal request has been paid successfully",
      );
      // send payout sent email
      await sendStorePayoutSentMail(store.email, response.data.amount);
    }

    return response;
  }
};

const encryptCard = async (text) => {
  let cipher = forge.cipher.createCipher(
    "3DES-ECB",
    forge.util.createBuffer(FLW_ENCKEY)
  );
  cipher.start({ iv: "" });
  cipher.update(forge.util.createBuffer(JSON.stringify(text), "utf-8"));
  cipher.finish();
  let encrypted = cipher.output;
  let clientCode = forge.util.encode64(encrypted.getBytes());
  let payload = {
    client: clientCode
  };
  let charge = await cardPayment(payload);
  return clientCode;
};

const verifyCardRequest = async (payload) => {
  let config = {
    headers: {
      Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY_LIVE}`,
    }
  };
  let flwRequest = await axios.post("https://api.flutterwave.com/v3/payments", payload, config);
  if (flwRequest.data.status === "error") throw { err: flwRequest.data.message, status: 400 };
  return flwRequest.data;
};

const getAllBanks = async () => {
  const payload = {
    country: "NG"
  };
  const response = await flw.Bank.country(payload);

  return response;
};

const getBankDetails = async (payload) => {
  const response = await flw.Misc.verify_Account(payload);
  if (response.status === "error") return { err: response.message, status: 400 };
  return response.data;
};

const getTransactions = async () => {
  const response = await flw.Transaction.fetch({});
  return response;
};

const initiateTransfer = async (payload) => {
  const response = await flw.Transfer.initiate(payload);
  return response;
};
export {
  flw, bankTransfer, verifyTransaction, encryptCard, ussdPayment, cardPayment, verifyCardRequest, getAllBanks, getBankDetails, getTransactions, initiateTransfer, verifyPayout
};
