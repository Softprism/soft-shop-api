import * as vatService from "../services/vat.service";

const createVat = async (req, res, next) => {
  try {
    const {
      amount, taxAmount, onOrder, paidBy
    } = req.body;
    const newVat = await vatService.createVat(
      amount, taxAmount, onOrder, paidBy
    );

    res.status(200).json({ success: true, result: newVat, status: 200 });
  } catch (error) {
    next(error);
  }
};

const removeVat = async (req, res, next) => {
  try {
    const action = await vatService.removeVat(
      req.params.vatId
    );

    res.status(200).json({ success: true, result: action, status: 200 });
  } catch (error) {
    next(error);
  }
};

export { createVat, removeVat };
