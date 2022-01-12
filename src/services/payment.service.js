import axios from "axios";
import dotenv from "dotenv";
import forge from "node-forge";
import Flutterwave from "flutterwave-node-v3";

import { response } from "express";
import User from "../models/user.model";
import Order from "../models/order.model";
import Store from "../models/store.model";
import StoreUpdate from "../models/store-update.model";
import { createTransaction } from "./transaction.service";
import Ledger from "../models/ledger.model";

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

  const { tx_ref } = response.data;
  if (tx_ref.includes("card")) {
    // user is adding a new card

    // return an error if response isn't succesful
    if (response.data.status !== "successful") {
      return { err: response.message, status: 400 };
    }

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
    // add card index to initiated payment card details
    response.data.card.card_index = card_index();

    // add new card details to user
    user.cards.push(response.data.card);
    user.save();

    // create credit transaction for Ledger
    let ledger = Ledger.findOne({});
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

    let order = await Order.findOne({ orderId: tx_ref });
    let store = await Store.findById(order.store);
    let ledger = Ledger.findOne({});

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
    }

    store.save();
    order.save();
    return order;
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
  return response;
};

export {
  flw, bankTransfer, verifyTransaction, encryptCard, ussdPayment, cardPayment, verifyCardRequest, getAllBanks, getBankDetails
};
