import axios from "axios";
import dotenv from "dotenv";

import Flutterwave from "flutterwave-node-v3";

dotenv.config();

const { FLUTTERWAVE_SECRET_KEY, FLUTTERWAVE_BASE_URL, PUBLIC_KEY } = process.env;
const flw = new Flutterwave(PUBLIC_KEY, FLUTTERWAVE_SECRET_KEY);

const bankTransfer = async (payload) => {
  const response = await flw.Charge.bank_transfer(payload);
  return response;
};
const verifyTransaction = async (payload) => {
  const response = await flw.Transaction.fetch(payload);
  return response;
};

export { bankTransfer, verifyTransaction };

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
