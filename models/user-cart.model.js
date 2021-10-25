import mongoose from "mongoose";

const BasketSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    store: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Store",
    },
    orderItems: [
      {
        productName: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        productImage: { type: String, required: true },
        price: { type: Number, required: true },
        product: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: "Product",
        },
      },
    ],
  },
  { timestamps: true }
);

const Basket = mongoose.model("Basket", BasketSchema);

export default Basket;
