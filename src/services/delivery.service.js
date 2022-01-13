import Rider from "../models/rider.model";
import Order from "../models/order.model";
import Delivery from "../models/delivery.model";

const createDelivery = async (orderId) => {
  const order = await Order.findById(orderId).populate([
    { path: "extra_data", populate: "store" },
    { path: "store", select: "name address" },
    { path: "user", select: "_id first_name, last_name" },
  ]);
  if (!order) {
    return { err: "Order does not exists.", status: 404, };
  }
  const {
    orderItems, user, store, deliveryAddress
  } = order;
  const newDelivery = {
    orderItems,
    pickup: store.address,
    dropOff: deliveryAddress,
    receiver: `${user.first_name} ${user.last_name}`,
    order: orderId,
    user: user._id,
  };

  const delivery = await Delivery.create(newDelivery);
  return delivery;
};

const acceptDelivery = async (deliveryId, riderId) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    return { err: "Delivery does not exists.", status: 404, };
  }
  if (delivery.rider || delivery.status !== "pending") {
    return { err: "Delivery has already been accepted by another rider.", status: 409, };
  }

  const updatedDelivery = await Delivery.findByIdAndUpdate(
    { _id: deliveryId },
    { status: "accepted", rider: riderId },
    { new: true }
  );
  return updatedDelivery;
};

const updatedDeliveryStatus = async (deliveryId, riderId, status) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    return { err: "Delivery does not exists.", status: 404, };
  }
  if (!delivery.rider || delivery.status === "pending") {
    return { err: "Delivery hasn't been accepted.", status: 409, };
  }

  const updatedDelivery = await Delivery.findByIdAndUpdate(
    { _id: deliveryId },
    { status },
    { new: true }
  );
  return updatedDelivery;
};

export { createDelivery, acceptDelivery, updatedDeliveryStatus };
