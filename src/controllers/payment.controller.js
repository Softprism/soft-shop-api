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
    return res.status(200).json({ success: true });
  }
  next();
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
    return res.status(200).json({
      success: true, result: details, status: 200
    });
  } catch (error) {
    next(error);
  }
  next();
};

export {
  verifyTransaction, acknowledgeFlwWebhook, getAllBanks, getBankDetails
};
