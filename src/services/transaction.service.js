import Ledger from "../models/ledger.model";
import Store from "../models/store.model";
import Transaction from "../models/transaction.model";
import { sendStoreCreditMail, sendStoreDebitMail } from "../utils/sendMail";

const createTransaction = async ({
  amount, type, to, receiver, status, ref
}) => {
  // validate if request contains a valid amount
  amount = Number(amount);
  if (amount === 0) return { err: "Please enter an amount", status: 400 };

  // create new transaction
  let newTrans = await Transaction.create({
    amount, type, to, receiver, status, ref
  });

  // credit store
  if (newTrans && to === "Store" && type === "Credit" && status === "completed") {
    let store = await Store.findById(receiver);
    store.account_details.total_credit += Number(amount);
    store.account_details.account_balance = Number(store.account_details.total_credit) - Number(store.account_details.total_debit);
    await store.save();
    let ledger = await Ledger.findOne({});
    ledger.payins += Number(amount);
    ledger.account_balance = Number(ledger.payins) - Number(ledger.payouts);
    await ledger.save();
    await sendStoreCreditMail(store.email, Number(amount));
  }

  // debit store
  if (newTrans && to === "Store" && type === "Debit") {
    let store = await Store.findById(receiver);
    store.account_details.total_debit += Number(amount);
    store.account_details.account_balance = Number(store.account_details.total_credit) - Number(store.account_details.total_debit);
    await store.save();
    await sendStoreDebitMail(store.email, Number(amount));
  }

  // credit ledger
  if (newTrans && to === "Ledger" && type === "Credit") {
    let ledger = await Ledger.findOne({});
    ledger.payins += Number(amount);
    ledger.account_balance = Number(ledger.payins) - Number(ledger.payouts);
    await ledger.save();
  }

  // debit store
  if (newTrans && to === "Ledger" && type === "Debit") {
    let ledger = await Ledger.findOne({});
    ledger.payouts += Number(amount);
    ledger.account_balance = Number(ledger.payins) - Number(ledger.payouts);
    await ledger.save();
  }
  return newTrans;
};

// eslint-disable-next-line import/prefer-default-export
export { createTransaction };
