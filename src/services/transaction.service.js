import Transaction from "../models/transaction.model";

const createTransaction = async (amount, type, to, receiver) => {
  let newTrans = await Transaction.create(amount, type, to, receiver);
  return newTrans;
};

// eslint-disable-next-line import/prefer-default-export
export { createTransaction };
