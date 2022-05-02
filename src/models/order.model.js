import mongoose from "mongoose";

const OrderSchema = mongoose.Schema(
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
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rider",
    },
    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery",
    },
    review: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
    orderId: {
      type: String,
      unique: true,
    },
    deliveryAddress: {
      type: String,
      required: true,
    },
    cancelReason: {
      type: String,
    },
    customerNote: {
      type: String,
      default: "Nothing."
    },
    paymentMethod: {
      type: String,
      enum: ["Card", "Transfer", "USSD"],
      required: true,
    },
    paymentResult: {},
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    deliveryPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    subtotal: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isFavorite: {
      type: Boolean,
      required: true,
      default: false,
    },
    isReviewed: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      required: true,
      default: "initiated",
      enum: [
        "initiated", // new order just created
        "sent", // payment confirmation sent
        "approved", // order approved by store
        "cancelled", // order cancelled by store
        "ready", // order ready for delivery
        "accepted", // order accepted by rider
        "enroute", // order is on the way user
        "arrived", // order delivered to user
        "delivered", // delivery completed
      ]
      // initiated (after creating order and await payment) => sent(payment confirmation) => approved(when store approves an order) => ready(store sends order for delivery => accepted(when rider accepts an order) => enroute(item is on the way) => delivered(item is at user's location) =>  completed(user receives order)
    },
    orderItems: [
      {
        productName: { type: String, required: true },
        qty: { type: Number, required: true },
        productImage: { type: String, required: true },
        price: { type: Number, required: true },
        totalPrice: { type: Number, required: true, default: 0.0 },
        product: {
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
            itemPrice: { type: Number, required: true },
            quantity: { type: Number, required: true },
            totalPrice: { type: Number, required: true, default: 0.0 },
          },
        ],
      },
    ],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", OrderSchema);

export default Order;
