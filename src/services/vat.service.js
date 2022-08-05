import Vat from "../models/vat.model";

const createVat = async (amount, taxAmount, onOrder, paidBy) => {
  let newTax = await Vat.create({
    amount, taxAmount, onOrder, paidBy
  });

  return newTax;
};

const removeVat = async (vatId) => {
  await Vat.findByIdAndDelete(vatId);
  return "Vat Record Deleted";
};

export { createVat, removeVat };
