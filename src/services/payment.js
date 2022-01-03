import axios from "axios";
import dotenv from "dotenv";
import forge from "node-forge";
import Flutterwave from "flutterwave-node-v3";

import User from "../models/user.model";
import Order from "../models/order.model";

dotenv.config();

const {
  FLUTTERWAVE_SECRET_KEY, FLW_ENCKEY, FLUTTERWAVE_BASE_URL, PUBLIC_KEY
} = process.env;
const flw = new Flutterwave(PUBLIC_KEY, FLUTTERWAVE_SECRET_KEY);

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

  if (response.status !== "success") {
    return { err: response.message, status: 400 };
  }
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
        // return id of format 'soft - aaaaa'
      return `cindex-${s4()}`;
    };

    // find user from payment initiated
    let user = await User.findById(response.data.meta.user_id).select("-orders -cards.token");

    // add card index to initiated payment card details
    response.data.card.card_index = card_index();

    // add card details to user
    user.cards.push(response.data.card);
    user.save();
    return user;
  }
  if (tx_ref.includes("soft")) {
    // user is paying for an order

    let order = await Order.findOne({ orderId: "soft-8517" });

    order.paymentResult = response.data;
    order.markModified("paymentResult");
    order.save();
    return order;
  }
};

const acknowledgeFlwWebhook = async (req, res, next) => {
  if (req.body.softshop !== "true") {
    res.status(200).json({ success: true });
  }

  next();
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
      Authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
    }
  };
  let flwRequest = await axios.post("https://api.flutterwave.com/v3/payments", payload, config);
  if (flwRequest.data.status === "error") throw { err: flwRequest.data.message, status: 400 };
  return flwRequest.data;
};

export {
  bankTransfer, verifyTransaction, acknowledgeFlwWebhook, encryptCard, ussdPayment, cardPayment, verifyCardRequest
};

// static async initializePayment(params) {
//   try {
//     const options = {
//       url: `${FLUTTERWAVE_BASE_URL}/payments`,
//       headers: {
//         authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
//         "content-type": "application/json",
//         "cache-control": "no-cache",
//       },
//       method: "POST",
//       data: params,
//     };

//     const response = await axios.request(options);
//     return response;
//   } catch (error) {
//     throw error;
//   }
// }

// /**
//  * Verify all transactions before updating their status in the DB
//  * @param {String} trxref The reference String to verify the transaction. It will be gotten after successfully
//  * initializing a transaction.
//  */

// static async verifyPayment(reference) {
//   try {
//     const options = {
//       url: `${FLUTTERWAVE_BASE_URL}/transactions/${reference}/verify`,
//       headers: {
//         authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
//         "content-type": "application/json",
//         "cache-control": "no-cache",
//       },
//       method: "GET",
//     };

//     const data = await axios.request(options);
//     return data;
//   } catch (error) {
//     throw error;
//   }
// }
