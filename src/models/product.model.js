import mongoose from "mongoose";

const ProductSchema = mongoose.Schema({
  product_name: { type: String, required: true },
  product_description: { type: String, required: true },
  product_image: [{ type: String, required: true }], // array to store multiple images
  store: { type: mongoose.Schema.Types.ObjectId, ref: "Store", required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  variantOpt: { type: Boolean, required: true },
  variants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variants",
      required() {
        return this.variantOpt === true;
      },
    },
  ],
  labels: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
  availability: { type: Boolean, required: true, default: false },
  status: { type: String, enum: ["active", "inactive"], default: "inactive" }, // deleted||active
  price: { type: Number, required: true },
  rating: { type: String, required: false },
  createdDate: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
