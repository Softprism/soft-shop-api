import Rider from "../models/rider.model";
import Order from "../models/order.model";
import Delivery from "../models/delivery.model";
import { sendUserOrderReadyMail } from "../utils/sendMail";
import { sendUserOrderPickedUpSMS } from "../utils/sendSMS";

const createDelivery = async (orderId, storeId) => {
  const order = await Order.findById(orderId).populate([
    { path: "store", select: "_id name address" },
    { path: "user", select: "_id first_name last_name phone_number email" },
  ]);
  if (!order) {
    return { err: "Order does not exists.", status: 404, };
  }

  if (order.status !== "sent") {
    return { err: "Payment hasn't been made for this Order.", status: 409, };
  }
  if ((order.store._id).toString() !== storeId) {
    return { err: "You're not permitted to carry out this action", status: 403, };
  }
  const {
    orderItems, user, store, deliveryAddress,
  } = order;
  let items = [];
  items = orderItems.map((orderItem) => {
    return `${orderItem.qty}X ${orderItem.productName}`;
  });
  const newDelivery = {
    item: items.toString(),
    pickup: store.address,
    dropOff: deliveryAddress,
    receiver: `${user.first_name} ${user.last_name}`,
    phone_number: user.phone_number,
    order: orderId,
    user: user._id,
  };

  const delivery = await Delivery.create(newDelivery);
  await Order.findByIdAndUpdate(
    { _id: orderId },
    { status: "ready" },
    { new: true }
  );
  await sendUserOrderReadyMail(user.email);
  return { delivery };
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
  await Order.findByIdAndUpdate(
    { _id: delivery.order },
    { status: "accepted" },
    { new: true }
  );
  return { updatedDelivery };
};

const updatedDeliveryStatus = async (deliveryId, riderId, status) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    return { err: "Delivery does not exists.", status: 404, };
  }
  if (delivery.rider.toString() !== riderId.toString()) {
    return { err: "You're not permitted to carry out this action.", status: 403, };
  }
  if (!delivery.rider || delivery.status === "pending") {
    return { err: "Delivery hasn't been accepted.", status: 409, };
  }
  if (status === "Start Delivery") {
    await Order.findByIdAndUpdate({ _id: delivery.order }, { status: "enroute" }, { new: true });
  }
  if (status === "Complete Drop off") {
    await Order.findByIdAndUpdate({ _id: delivery.order }, { status: "delivered" }, { new: true });
  }

  const updatedstatus = await Delivery.findByIdAndUpdate(
    deliveryId,
    { status },
    { new: true }
  );
  return { updatedstatus };
};

const updatedRiderStatus = async (deliveryId, riderId, status) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    return { err: "Delivery does not exists.", status: 404, };
  }
  if (delivery.rider.toString() !== riderId.toString()) {
    return { err: "You're not permitted to carry out this action.", status: 403, };
  }
  if (!delivery.rider || delivery.status === "pending") {
    return { err: "Delivery hasn't been accepted.", status: 409, };
  }

  const updatedstatus = await Delivery.findByIdAndUpdate(
    deliveryId,
    { riderStatus: status },
    { new: true }
  );
  return { updatedstatus };
};

const completeDelivery = async (orderId, userId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    return { err: "Order does not exists.", status: 404, };
  }
  if (order.user.toString() !== userId.toString()) {
    return { err: "You're not permitted to carry out this action", status: 403, };
  }
  const delivery = await Delivery.findOne({ order: orderId });
  if (!delivery) {
    return { err: "Delivery does not exists.", status: 404, };
  }
  if (delivery.riderStatus !== "Complete Drop off") {
    return { err: "Kindly wait for rider to confirm delivery", status: 403, };
  }
  const updatedOrder = await Order.findByIdAndUpdate(
    orderId,
    { status: "completed" },
    { new: true }
  );
  return { updatedOrder, delivery };
};

const getAllDeliveries = async (riderId, urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);

  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.page;

  const deliveries = await Delivery.find({ rider: riderId })
    .populate([
      { path: "rider", select: "_id first_name last_name" },
      {
        path: "order", select: "deliveryAddress", populate: "store"
      },
      { path: "user", select: "_id first_name last_name phone_number" },
    ])
    .sort({ createdDate: -1 }) // -1 for descending sort
    .skip(skip)
    .limit(limit);

  return { deliveries };
};

const getDeliveriesByStatus = async (riderId, status) => {
  const deliveries = await Delivery.find({ rider: riderId, status }).populate([
    { path: "rider", select: "first_name last_name" },
    {
      path: "order", select: "deliveryAddress", populate: "store"
    },
    { path: "user", select: "_id first_name last_name phone_number" },
  ])
    .sort({ createdDate: -1 }); // -1 for descending sort

  return { deliveries };
};

const getDeliveryById = async (deliveryId, riderId) => {
  const delivery = await Delivery.findOne({ _id: deliveryId, rider: riderId })
    .populate([
      { path: "rider", select: "first_name last_name" },
      {
        path: "order", select: "deliveryAddress", populate: "store"
      },
      { path: "user", select: "_id first_name, last_name phone_number" },
    ]);
  if (!delivery) {
    return {
      err: "Delivery does not exists.",
      status: 404,
    };
  }
  return { delivery };
};

export {
  createDelivery, acceptDelivery, updatedDeliveryStatus, updatedRiderStatus,
  getAllDeliveries, getDeliveryById, getDeliveriesByStatus, completeDelivery
};
