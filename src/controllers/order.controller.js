import { validationResult } from "express-validator";
import * as orderService from "../services/order.service";

//= =====================================================================

const getOrders = async (req, res, next) => {
  const allOrders = await orderService.getOrders(req.query);

  if (allOrders.err) {
    return res.status(500).json({ success: false, msg: allOrders.err, status: allOrders.status });
  }

  return res.status(200).json({ success: true, result: allOrders, size: allOrders.length });
};

//= =====================================================================

const createOrder = async (req, res, next) => {
  if (req.user) req.body.user = req.user.id;

  let newOrder = await orderService.createOrder(req.body);

  if (newOrder.err) return res.status(500).json({ success: false, msg: newOrder.err, status: newOrder.status });

  return res.status(201).json({ success: true, result: newOrder });
};

//= =====================================================================

const toggleFavorite = async (req, res, next) => {
  let favoriteOrder = await orderService.toggleFavorite(req.params.orderID);

  if (favoriteOrder.err) return res.status(500).json({ success: false, msg: favoriteOrder.err, status: favoriteOrder.status });

  return res.status(200).json({ success: true, result: favoriteOrder.msg });
};

//= =====================================================================

const getOrderDetails = async (req, res, next) => {
  const orderDetails = await orderService.getOrderDetails(req.params.orderID);

  if (orderDetails.err) return res.status(500).json({ success: false, msg: orderDetails.err, status: orderDetails.status });

  return res.status(200).json({ success: true, result: orderDetails });
};

//= =====================================================================

const editOrder = async (req, res, next) => {
  let updatedOrder = await orderService.editOrder(req.params.orderID, req.body);

  if (updatedOrder.err) return res.status(500).json({ success: false, msg: updatedOrder.err, status: updatedOrder.status });

  return res.status(200).json({ success: true, result: updatedOrder });
};
//= =====================================================================

const reviewOrder = async (req, res, next) => {
  if (req.params.orderId) req.body.order = req.params.orderId;

  if (req.store) {
    return res
      .status(400)
      .json({ success: false, msg: "action not allowed by store" });
  }
  if (req.user) req.body.user = req.user.id;

  const newReview = await orderService.reviewOrder(req.body);

  if (newReview.err) {
    return res.status(400).json({ success: false, msg: newReview.err, status: newReview.status });
  }

  res.status(200).json({ success: true, result: newReview });
};

export {
  getOrders,
  createOrder,
  toggleFavorite,
  getOrderDetails,
  editOrder,
  reviewOrder,
};
