import mongoose from "mongoose";
import { DateTime } from "luxon";

const now = new Date();

const BasketSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    product: {
      productName: { type: String, required: true },
      qty: { type: Number, required: true, default: 1 },
      productImage: { type: String, required: true },
      price: { type: Number, required: true },
      totalPrice: { type: Number, required: true, default: 0.0 }, // qty * price
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      selectedVariants: [
        {
          variantId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Variants",
          },
          variantTitle: { type: String, required: true },
          itemName: { type: String, required: true },
          itemPrice: { type: Number, required: true, default: 0.0 },
          quantity: { type: Number, required: true },
          totalPrice: { type: Number, required: true, default: 0.0 },
        },
      ],
    },
    createdAt: { type: String, default: DateTime.fromJSDate(now).toString() },
  },
  { timestamps: true }
);

const Basket = mongoose.model("Basket", BasketSchema);

export default Basket;
