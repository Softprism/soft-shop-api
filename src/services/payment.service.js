import axios from "axios";
import dotenv from "dotenv";
import forge from "node-forge";
import Flutterwave from "flutterwave-node-v3";

import User from "../models/user.model";
import Order from "../models/order.model";

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
  const response = await flw.Charge.card(payload);
  return response;
};
const verifyTransaction = async (paymentDetails) => {
  // this verifies a transaction with flutter
  // if it's a new card transaction, it adds the cards details to the user profile
  // if it's a order transaction, it adds the payment details to the order payment result

  const response = await flw.Transaction.verify({ id: paymentDetails.data.id });
  console.log(response);

  // return an error if response isn't succesful
  if (response.status !== "success") {
    return { err: response.message, status: 400 };
  }

  // continue operations if transaction has been verified
  const { tx_ref } = response.data;
  if (tx_ref.includes("card")) {
    // user is adding a new card

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
      console.log(refund);
      return { err: "This card has been added already. Transaction would be refunded.", status: 409 };
    }

    // find user from payment initiated
    let user = await User.findById(response.data.meta.user_id).select("-orders -cards.token");

    // add card index to initiated payment card details
    response.data.card.card_index = card_index();

    // add new card details to user
    user.cards.push(response.data.card);
    user.save();
    return user;
  }
  if (tx_ref.includes("soft")) {
    // user is paying for an order

    let order = await Order.findOne({ orderId: tx_ref });

    order.paymentResult = response.data;
    order.markModified("paymentResult");
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

export {
  bankTransfer, verifyTransaction, encryptCard, ussdPayment, cardPayment, verifyCardRequest
};
