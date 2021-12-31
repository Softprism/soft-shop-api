import axios from "axios";

const { FLUTTERWAVE_SECRET_KEY, FLUTTERWAVE_BASE_URL } = process.env;
export default class Payment {
  static async initializePayment(params) {
    try {
      const options = {
        url: `${FLUTTERWAVE_BASE_URL}/payments`,
        headers: {
          authorization: `Bearer ${FLUTTERWAVE_SECRET_KEY}`,
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
        method: "POST",
        data: params,
      };

      const response = await axios.request(options);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify all transactions before updating their status in the DB
   * @param {String} trxref The reference String to verify the transaction. It will be gotten after successfully
   * initializing a transaction.
   */

  static async verifyPayment(reference) {
    try {
      const options = {
        url: `${FLUTTERWAVE_BASE_URL}/transactions/${reference}/verify`,
        headers: {
          authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          "content-type": "application/json",
          "cache-control": "no-cache",
        },
        method: "GET",
      };

      const data = await axios.request(options);
      return data;
    } catch (error) {
      throw error;
    }
  }
}
