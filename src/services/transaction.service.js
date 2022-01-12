import Store from "../models/store.model";
import Transaction from "../models/transaction.model";

const createTransaction = async ({
  amount, type, to, receiver, status
}) => {
  // validate if request contains a valid amount
  amount = Number(amount);
  if (amount === 0) return { err: "Please enter an amount", status: 400 };

  // create new transaction
  let newTrans = await Transaction.create({
    amount, type, to, receiver, status
  });

  // credit store
  if (newTrans && to === "Store" && type === "Credit") {
    let store = await Store.findById(receiver);
    store.account_details.total_credit += Number(amount);
    store.account_details.account_balance = Number(store.account_details.total_credit) - Number(store.account_details.total_debit);
    store.save();
  }

  // debit store
  if (newTrans && to === "Store" && type === "Debit") {
    let store = await Store.findById(receiver);
    store.account_details.total_debit += Number(amount);
    store.account_details.account_balance = Number(store.account_details.total_credit) - Number(store.account_details.total_debit);
    store.save();
  }
  return newTrans;
};

// eslint-disable-next-line import/prefer-default-export
export { createTransaction };
