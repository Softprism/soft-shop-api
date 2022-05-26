import Ledger from "../models/ledger.model";
import Logistics from "../models/logistics-company.model";
import Rider from "../models/rider.model";
import Store from "../models/store.model";
import Transaction from "../models/transaction.model";
import {
  sendRiderCreditMail,
  sendRiderDebitMail, sendStoreCreditMail, sendStoreDebitMail
} from "../utils/sendMail";
import { sendMany } from "./push.service";

const createTransaction = async ({
  amount, type, to, receiver, status, ref, fee
}) => {
  // validate if request contains a valid amount
  amount = Number(amount);
  if (amount === 0) return { err: "Please enter an amount", status: 400 };

  // create new transaction
  let newTrans = await Transaction.create({
    amount, type, to, receiver, status, ref, fee
  });

  // credit store
  if (newTrans && to === "Store" && type === "Credit" && status === "completed") {
    let store = await Store.findById(receiver);
    store.account_details.total_credit += Number(amount);
    store.account_details.account_balance = Number(store.account_details.total_credit) - Number(store.account_details.total_debit);
    await store.save();

    // send email to store on credit
    await sendStoreCreditMail(store.email, amount);

    // send push notification to store on credit
    await sendMany(
      "ssa",
      store.vendorPushDeviceToken,
      "Your SoftShop Account Has Been Credited",
      `Your SoftShop account has been credited with ${amount}`,
      {}
    );
  }

  // debit store
  if (newTrans && to === "Store" && type === "Debit") {
    let store = await Store.findById(receiver);
    store.account_details.total_debit += Number(amount);
    store.account_details.account_balance = Number(store.account_details.total_credit) - Number(store.account_details.total_debit);
    await store.save();

    // send email to store on debit
    await sendStoreDebitMail(store.email, amount);

    // send push notification to store on debit
    await sendMany(
      "ssa",
      store.vendorPushDeviceToken,
      "Your SoftShop Account Has Been Debited",
      `Your SoftShop account has been debited with ${amount}`,
      {}
    );
  }

  // credit ledger
  if (newTrans && to === "Ledger" && type === "Credit") {
    let ledger = await Ledger.findOne({});
    ledger.payins += Number(amount);
    ledger.account_balance = Number(ledger.payins) - Number(ledger.payouts);
    await ledger.save();
  }

  // debit ledger
  if (newTrans && to === "Ledger" && type === "Debit") {
    let ledger = await Ledger.findOne({});
    ledger.payouts += Number(amount);
    ledger.account_balance = Number(ledger.payins) - Number(ledger.payouts);
    await ledger.save();
  }

  // credit rider
  if (newTrans && to === "Rider" && type === "Credit") {
    let rider = await Rider.findById(receiver);
    rider.account_details.total_credit += Number(amount);
    rider.account_details.account_balance = Number(rider.account_details.total_credit) - Number(rider.account_details.total_debit);
    await rider.save();

    // send email to rider on credit
    await sendRiderCreditMail(rider.email, amount);

    // send push notification to rider on credit
    await sendMany(
      "ssa",
      rider.pushDeviceToken,
      "Your SoftShop Account Has Been Credited",
      `Your SoftShop account has been credited with ${amount}`,
      {}
    );
  }

  // debit rider
  if (newTrans && to === "Rider" && type === "Debit") {
    let rider = await Rider.findById(receiver);
    rider.account_details.total_debit += Number(amount);
    rider.account_details.account_balance = Number(rider.account_details.total_credit) - Number(rider.account_details.total_debit);
    await rider.save();

    // send email to rider on debit
    await sendRiderDebitMail(rider.email, Number(amount));

    // send push notification to rider on debit
    await sendMany(
      "ssa",
      rider.pushDeviceToken,
      "Your SoftShop Account Has Been Debited",
      `Your SoftShop account has been debited with ${amount}`,
      {}
    );
  }

  // credit logistics company
  if (newTrans && to === "logistics" && type === "Credit") {
    let logistics = await Logistics.findById(receiver);
    logistics.account_details.total_credit += Number(amount);
    logistics.account_details.account_balance = Number(logistics.account_details.total_credit) - Number(logistics.account_details.total_debit);
    await logistics.save();

    // send email to logistics company on credit
    await sendRiderCreditMail(logistics.email, amount);
  }

  // debit logistics company
  if (newTrans && to === "logistics" && type === "Debit") {
    let logistics = await Logistics.findById(receiver);
    logistics.account_details.total_debit += Number(amount);
    logistics.account_details.account_balance = Number(logistics.account_details.total_credit) - Number(logistics.account_details.total_debit);
    await logistics.save();

    // send email to logistics company on debit
    await sendRiderDebitMail(logistics.email, Number(amount));
  }

  return newTrans;
};

// eslint-disable-next-line import/prefer-default-export
export { createTransaction };
