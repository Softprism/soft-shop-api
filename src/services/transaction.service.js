import Store from "../models/store.model";
import Transaction from "../models/transaction.model";

const createTransaction = async ({
  amount, type, to, receiver, status, request
}) => {
  let newTrans = await Transaction.create({
    amount, type, to, receiver, status
  });
  if (newTrans && to === "Store" && request !== true) {
    let store = await Store.findById(receiver);
    store.account_details.total_credit += Number(amount);
    store.account_details.account_balance = Number(store.account_details.total_credit) - Number(store.account_details.total_debit);
    store.save();
  }
  return newTrans;
};

// eslint-disable-next-line import/prefer-default-export
export { createTransaction };
