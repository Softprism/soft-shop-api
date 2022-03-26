import * as paymentService from "../services/payment.service";

const verifyTransaction = async (req, res, next) => {
  try {
    let verify = await paymentService.verifyTransaction(req.body);
    return res.status(200).json({ success: true, result: verify, status: 200 });
  } catch (error) {
    next(error);
  }
};

const acknowledgeFlwWebhook = async (req, res, next) => {
  if (req.body.softshop !== "true") {
    res.status(200).json({ success: true });
    paymentService.verifyTransaction(req.body);
  }
};

const getAllBanks = async (req, res, next) => {
  try {
    let banks = await paymentService.getAllBanks();
    return res.status(200).json({
      success: true, result: banks, count: banks.data.length, status: 200
    });
  } catch (error) {
    next(error);
  }
  next();
};

const getBankDetails = async (req, res, next) => {
  try {
    let details = await paymentService.getBankDetails(req.body);
    if (details.err) {
      return res.status(details.status).json({ success: false, msg: details.err, status: details.status });
    }
    return res.status(200).json({
      success: true, result: details, status: 200
    });
  } catch (error) {
    next(error);
  }
  next();
};

const getTransactions = async (req, res, next) => {
  try {
    let transaction = await paymentService.getTransactions();
    return res.status(200).json({
      success: true, result: transaction, status: 200
    });
  } catch (error) {
    next(error);
  }
  next();
};

export {
  verifyTransaction, acknowledgeFlwWebhook, getAllBanks, getBankDetails, getTransactions
};
