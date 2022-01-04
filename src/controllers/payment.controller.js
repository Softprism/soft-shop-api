import * as paymentService from "../services/payment.service";

const verifyTransaction = async (req, res, next) => {
  try {
    let verify = await paymentService.verifyTransaction(req.body);
    res.status(200).json({ success: true, result: verify, status: 200 });
  } catch (error) {
    next(error);
  }
};

const acknowledgeFlwWebhook = async (req, res, next) => {
  if (req.body.softshop !== "true") {
    res.status(200).json({ success: true });
  }
  next();
};

export { verifyTransaction, acknowledgeFlwWebhook };
