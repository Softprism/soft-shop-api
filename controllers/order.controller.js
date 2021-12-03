import * as orderService from "../services/order.service.js";
import { validationResult } from "express-validator";

//======================================================================

const getOrders = async (req, res, next) => {
  const allOrders = await orderService.getOrders(req.query);

  if (allOrders.err) {
    return res.status(500).json({ success: false, msg: allOrders.err });
  }

  allOrders && allOrders.length > 0
    ? res
        .status(200)
        .json({ success: true, result: allOrders, size: allOrders.length })
    : res.status(404).json({ success: false, msg: "No order found" });
};

//======================================================================

const createOrder = async (req, res, next) => {
  if (req.user) req.body.user = req.user.id;

  let newOrder = await orderService.createOrder(req.body);

  newOrder.err
    ? res.status(500).json({ success: false, msg: newOrder.err })
    : res.status(201).json({ success: true, result: newOrder });
};

//======================================================================

const toggleFavorite = async (req, res, next) => {
  let favoriteOrder = await orderService.toggleFavorite(req.params.orderID);

  favoriteOrder.err
    ? res.status(500).json({ success: false, msg: favoriteOrder.err })
    : res.status(200).json({ success: true, result: favoriteOrder.msg });
};

//======================================================================

const getOrderDetails = async (req, res, next) => {
  const orderDetails = await orderService.getOrderDetails(req.params.orderID);

  orderDetails.err
    ? res.status(500).json({ success: false, msg: orderDetails.err })
    : res.status(200).json({ success: true, result: orderDetails });
};

//======================================================================

const editOrder = async (req, res, next) => {
  let updatedOrder = await orderService.editOrder(req.params.orderID, req.body);

  updatedOrder.err
    ? res.status(500).json({ success: false, msg: updatedOrder.err })
    : res.status(200).json({ success: true, result: updatedOrder });
};
//======================================================================

const reviewOrder = async (req, res, next) => {
  if (req.store) {
    return res
      .status(400)
      .json({ success: false, msg: "action not allowed by store" });
  }
  const newReview = await orderService.reviewOrder(req.body);

  if (newReview.err) {
    return res.status(400).json({ success: false, msg: newReview.err });
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
