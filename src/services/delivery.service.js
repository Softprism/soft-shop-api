import Rider from "../models/rider.model";
import Order from "../models/order.model";
import Delivery from "../models/delivery.model";

const createDelivery = async (orderId, storeId) => {
  // find the order
  const order = await Order.findById(orderId).populate([
    { path: "store", select: "_id name address" },
    { path: "user", select: "_id first_name last_name phone_number" },
  ]);
  // check for if order exist
  if (!order) {
    return { err: "Order does not exists.", status: 404, };
  }
  // check for order status
  if (order.status === "ready" || order.status === "accepted" || order.status === "enroute" || order.status === "delivered" || order.status === "completed") {
    return { err: "Sorry you can't create delivery for this Order.", status: 409, };
  }
  // check for order payment status
  if (order.status !== "sent") {
    return { err: "Payment hasn't been made for this Order.", status: 409, };
  }
  // check if store owner is the same with the logged in user
  if ((order.store._id).toString() !== storeId) {
    return { err: "You're not permitted to carry out this action", status: 403, };
  }
  const {
    orderItems, user, store, deliveryAddress
  } = order;
  let items = [];
  // create item name and quantity
  items = orderItems.map((orderItem) => {
    return `${orderItem.qty}X ${orderItem.productName}`;
  });
  // new delivery pbject to be created
  const newDelivery = {
    item: items.toString(),
    pickup: store.address,
    dropOff: deliveryAddress,
    receiver: `${user.first_name} ${user.last_name}`,
    phone_number: user.phone_number,
    order: orderId,
    user: user._id,
  };
  // create delivery
  const delivery = await Delivery.create(newDelivery);
  // uodate orser status to ready
  await Order.findByIdAndUpdate(
    { _id: orderId },
    { status: "ready" },
    { new: true }
  );
  return { delivery };
};

const acceptDelivery = async (deliveryId, riderId) => {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) {
    return { err: "Delivery does not exists.", status: 404, };
  }
  // check if delivery has already been assigned to a rider
  if (delivery.rider || delivery.status !== "pending") {
    return { err: "Delivery has already been accepted by another rider.", status: 409, };
  }
  // update  delivery status
  const updatedDelivery = await Delivery.findByIdAndUpdate(
    { _id: deliveryId },
    { status: "accepted", rider: riderId },
    { new: true }
  );
  // update order status
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
  // check if delivery rider is the same with the logged in rider
  if (delivery.rider.toString() !== riderId.toString()) {
    return { err: "You're not permitted to carry out this action.", status: 403, };
  }
  // check if delivery has been assiged to a rider
  if (!delivery.rider || delivery.status === "pending") {
    return { err: "Delivery hasn't been accepted.", status: 409, };
  }
  // update order Status
  if (status === "Start Delivery") {
    await Order.findByIdAndUpdate({ _id: delivery.order }, { status: "enroute" }, { new: true });
  }
  // update order Status
  if (status === "Complete Drop off") {
    await Order.findByIdAndUpdate({ _id: delivery.order }, { status: "delivered" }, { new: true });
  }
  // update delivery Status
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
  // check if delivery rider is the same with the logged in rider
  if (delivery.rider.toString() !== riderId.toString()) {
    return { err: "You're not permitted to carry out this action.", status: 403, };
  }
  // check if delivery has been assiged to a rider
  if (!delivery.rider || delivery.status === "pending") {
    return { err: "Delivery hasn't been accepted.", status: 409, };
  }
  // update order Status
  if (status === "Start Delivery") {
    await Order.findByIdAndUpdate({ _id: delivery.order }, { status: "enroute" }, { new: true });
  }
  // update order Status
  if (status === "Complete Drop off") {
    await Order.findByIdAndUpdate({ _id: delivery.order }, { status: "delivered" }, { new: true });
  }
  // update delivery Status
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
  // check if user who requested for order is the same with the logged in user
  if (order.user.toString() !== userId.toString()) {
    return { err: "You're not permitted to carry out this action", status: 403, };
  }
  // check for delivery
  const delivery = await Delivery.findOne({ order: orderId });
  if (!delivery) {
    return { err: "Delivery does not exists.", status: 404, };
  }
  // update delivery Status
  if (delivery.riderStatus !== "Complete Drop off") {
    return { err: "Kindly wait for rider to confirm delivery", status: 403, };
  }
  // update order Status
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
  let condition = {};
  if (urlParams.status) {
    condition.status = urlParams.status;
  }
  condition.rider = riderId;
  const deliveries = await Delivery.find(condition)
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
  getAllDeliveries, getDeliveryById, completeDelivery
};
