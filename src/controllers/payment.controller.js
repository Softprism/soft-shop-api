import * as paymentService from "../services/payment";

const verifyTransaction = async (req, res, next) => {
  try {
    console.log(req.body);
    let verify = await paymentService.verifyTransaction(req.body);
    res.status(200).json({ success: true, result: verify, status: 200 });
  } catch (error) {
    next(error);
  }
};

export { verifyTransaction };
