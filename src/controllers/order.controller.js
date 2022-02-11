import { validationResult } from "express-validator";
import * as orderService from "../services/order.service";

//= =====================================================================

const getOrders = async (req, res, next) => {
  try {
    const allOrders = await orderService.getOrders(req.query);

    return res.status(200).json({ success: true, result: allOrders, size: allOrders.length });
  } catch (error) {
    next(error);
  }
};

//= =====================================================================

const createOrder = async (req, res, next) => {
  try {
    if (req.user) req.body.user = req.user.id;

    const newOrder = await orderService.createOrder(req.body);

    if (newOrder.err) return res.status(newOrder.status).json({ success: false, msg: newOrder.err, status: newOrder.status });

    return res.status(201).json({ success: true, result: newOrder });
  } catch (error) {
    next(error);
  }
};

//= =====================================================================

const toggleFavorite = async (req, res, next) => {
  try {
    const favoriteOrder = await orderService.toggleFavorite(req.params.orderID);

    if (favoriteOrder.err) return res.status(favoriteOrder.status).json({ success: false, msg: favoriteOrder.err, status: favoriteOrder.status });

    return res.status(200).json({ success: true, result: favoriteOrder.msg });
  } catch (error) {
    next(error);
  }
};

//= =====================================================================

const getOrderDetails = async (req, res, next) => {
  try {
    const orderDetails = await orderService.getOrderDetails(req.params.orderID);

    if (orderDetails.err) return res.status(orderDetails.status).json({ success: false, msg: orderDetails.err, status: orderDetails.status });

    return res.status(200).json({ success: true, result: orderDetails });
  } catch (error) {
    next(error);
  }
};

//= =====================================================================

const editOrder = async (req, res, next) => {
  try {
    let updatedOrder = await orderService.editOrder(req.params.orderID, req.body);

    res.status(200).json({ success: true, result: updatedOrder });

    // prepare data for next middleware
    req.localData = {
      name: updatedOrder.store.name,
      email: updatedOrder.store.email
    };
    next();
  } catch (error) {
    next(error);
  }
};
//= =====================================================================

const reviewOrder = async (req, res, next) => {
  try {
    if (req.params.orderId) req.body.order = req.params.orderId;

    if (req.store) {
      return res
        .status(400)
        .json({ success: false, msg: "action not allowed by store", status: 400 });
    }
    if (req.user) req.body.user = req.user.id;

    const newReview = await orderService.reviewOrder(req.body);

    if (newReview.err) {
      return res.status(newReview.status).json({ success: false, msg: newReview.err, status: newReview.status });
    }

    res.status(200).json({ success: true, result: newReview, status: 200 });
  } catch (error) {
    next(error);
  }
};

const encryptDetails = async (req, res, next) => {
  const result = await orderService.encryptDetails(req.body);
  return res.status(200).json({ success: true, result, status: 200 });
};

export {
  getOrders,
  createOrder,
  toggleFavorite,
  getOrderDetails,
  editOrder,
  reviewOrder,
  encryptDetails
};
