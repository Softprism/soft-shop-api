import Order from "../models/order.model";
import Rider from "../models/rider.model";
import { createNotification } from "../services/notification.service";
import * as orderService from "../services/order.service";
import { sendOne } from "../services/push.service";
import { sendNewOrderInitiatedMail } from "../utils/sendMail";

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

    res.status(201).json({ success: true, result: newOrder });

    // update order
    let orderUpdate = await Order.findById(newOrder._id);
    orderUpdate.orderItems = newOrder.orderItems;
    orderUpdate.totalPrice = newOrder.totalPrice;
    orderUpdate.taxPrice = newOrder.taxPrice;
    orderUpdate.subtotal = newOrder.subtotal;
    orderUpdate.paymentResult = newOrder.paymentResult;

    if (newOrder.paymentMethod === "Transfer") {
      orderUpdate.paymentResult.account_name = newOrder.paymentResult.account_name;
    }
    orderUpdate.markModified("paymentResult");
    await orderUpdate.save();

    // send email notification on order initiated
    await sendNewOrderInitiatedMail(newOrder.orderId, newOrder.user.email, newOrder.totalPrice, newOrder.store.name);

    // notify order app on new order
    await sendOne(
      "sso",
      newOrder.store.orderPushDeivceToken,
      "New Order",
    );

    // create notification for rider
    let riders = await Rider.find();
    let ridersId = [];
    if (riders) {
      ridersId = riders.map((rider) => {
        return rider._id;
      });
    }
    await createNotification(ridersId, newOrder._id);
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

    return res.status(200).json({ success: true, result: orderDetails[0] });
  } catch (error) {
    next(error);
  }
};

//= =====================================================================

const editOrder = async (req, res, next) => {
  try {
    let updatedOrder = await orderService.editOrder(req.params.orderID, req.body);
    if (updatedOrder.err) return res.status(updatedOrder.status).json({ success: false, msg: updatedOrder.err, status: updatedOrder.status });

    res.status(200).json({ success: true, result: updatedOrder });
    // prepare data for next middleware
    req.localData = {
      user_id: updatedOrder.user._id,
      order_id: updatedOrder._id,
      store_id: updatedOrder.store._id,
      store_name: updatedOrder.store.name,
      store_email: updatedOrder.store.email,
      user_email: updatedOrder.user.email,
      user_phone: updatedOrder.user.phone_number,
      user_name: updatedOrder.user.first_name,
      delivery_address: updatedOrder.deliveryAddress,
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
