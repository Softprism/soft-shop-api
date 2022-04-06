import Order from "../models/order.model";
import Delivery from "../models/delivery.model";
import Review from "../models/review.model";
import Store from "../models/store.model";

const createDelivery = async (orderId, storeId) => {
  // find the order
  const order = await Order.findById(orderId).populate([
    { path: "store", select: "_id name address" },
    { path: "user", select: "_id first_name last_name phone_number email" },
  ]);
  // check for if order exist
  if (!order) {
    return { err: "Order does not exists.", status: 404, };
  }
  // check for order status
  if (order.status === "sent" || order.status === "accepted" || order.status === "enroute" || order.status === "delivered" || order.status === "completed") {
    return { err: "Sorry you can't create delivery for this Order.", status: 409, };
  }
  // check for order payment status
  if (order.status !== "ready") {
    return { err: "Order isn't ready for delivery.", status: 409, };
  }
  // check if store owner is the same with the logged in user
  if ((order.store._id).toString() !== storeId) {
    return { err: "You're not permitted to carry out this action", status: 403, };
  }
  const {
    orderItems, user, store, deliveryAddress,
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
    store: store._id
  };
  // create delivery
  const delivery = await Delivery.create(newDelivery);
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
    await Delivery.findByIdAndUpdate(deliveryId, { status: "delivered" });
  }
  // update order Status
  if (status === "Complete Drop off") {
    await Order.findByIdAndUpdate({ _id: delivery.order }, { status: "completed" }, { new: true });
    await Delivery.findByIdAndUpdate(deliveryId, { status: "delivered" });
  }
  // update order Status
  if (status === "Cancelled") {
    await Order.findByIdAndUpdate({ _id: delivery.order }, { status: "cancelled" }, { new: true });
    await Delivery.findByIdAndUpdate(deliveryId, { status: "failed" });
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

const getAllDeliveries = async (urlParams) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  let { sort } = urlParams;

  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.page;
  let condition = {};
  if (urlParams.status) {
    condition.status = urlParams.status;
  }
  if (urlParams.rider) {
    condition.rider = urlParams.rider;
  }
  // check for sort type
  if (urlParams.sortType === "desc") sort = `-${sort}`;
  if (!urlParams.sort) sort = "createdDate";
  const deliveries = await Delivery.find(condition)
    .populate([
      { path: "rider", select: "_id first_name last_name" },
      {
        path: "order", select: "deliveryAddress", populate: "store"
      },
      { path: "user", select: "_id first_name last_name phone_number address" },
    ])
    .sort(sort) // -1 for descending sort
    .skip(skip)
    .limit(limit);

  return { deliveries };
};

const getDeliveryById = async (deliveryId) => {
  const delivery = await Delivery.findOne({ _id: deliveryId })
    .populate([
      { path: "rider", select: "first_name last_name" },
      {
        path: "order", select: "deliveryAddress", populate: "store"
      },
      { path: "user", select: "_id first_name last_name phone_number address" },
    ]);
  if (!delivery) {
    return {
      err: "Delivery does not exists.",
      status: 404,
    };
  }
  return { delivery };
};

const reviewDelivery = async (review) => {
  // check if store exists
  const store = await Store.findById(review.store);
  if (!store) return { err: "Store does not exists.", status: 404 };
  // check if delivery exists in stores's account
  const delivery = await Delivery.findOne({
    _id: review.delivery,
    store: store._id
  });
  if (!delivery) return { err: "Delivery not found.", status: 404 };
  if (delivery.status !== "delivered") return { err: "You are only allowed to review a delivery that does not have a status of delivered", status: 404 };

  // check if store has made any review
  const isReviewed = await Review.findOne({
    delivery: review.delivery,
    store: review.store,
  });
  if (isReviewed) return { err: "Your review has been submitted for this order already.", status: 409 };
  review.rider = delivery.rider;
  const newReview = Review.create(review);
  return newReview;
};

export {
  createDelivery, acceptDelivery, updatedDeliveryStatus, updatedRiderStatus,
  getAllDeliveries, getDeliveryById, completeDelivery, reviewDelivery
};
