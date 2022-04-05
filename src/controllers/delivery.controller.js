import {
  createDelivery, acceptDelivery, updatedDeliveryStatus, updatedRiderStatus,
  getAllDeliveries, getDeliveryById, completeDelivery, reviewDelivery
} from "../services/delivery.service";

// ========================================================================== //
const create_Delivery = async (req, res, next) => {
  try {
    const action = await createDelivery(req.params.orderId, req.store.id);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    res.status(201).json({ success: true, result: action.delivery, status: 201 });
    req.data = {
      order_id: action.delivery.order,
      user_id: action.delivery.user,
    };
    next();
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //
const accept_Delivery = async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const { _id } = req.rider;
    const action = await acceptDelivery(deliveryId, _id);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    res.status(200).json({ success: true, result: action.updatedDelivery, status: 200 });
    req.data = {
      order_id: action.delivery.order,
      user_id: action.delivery.user,
      store_id: action.delivery.store,
      rider_id: action.updatedstatus.rider,
    };
    next();
  } catch (error) {
    next(error);
  }
};

const update_DeliveryStatus = async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.query;
    const { _id } = req.rider;
    const action = await updatedDeliveryStatus(deliveryId, _id, status);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    res.status(200).json({ success: true, result: action.updatedstatus, status: 200 });

    req.localData = {
      store_id: action.updatedstatus.store,
      rider_id: action.updatedstatus.rider,
      order_id: action.updatedstatus.order,
      user_id: action.updatedstatus.user
    };
    next();
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //
const complete_Delivery = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { id } = req.user;
    const action = await completeDelivery(orderId, id);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    return res.status(200).json({
      success: true,
      result: { order: action.updatedOrder, delivery: action.delivery },
      status: 200
    });
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //
const update_RiderStatus = async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.query;
    const { _id } = req.rider;
    const action = await updatedRiderStatus(deliveryId, _id, status);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    res.status(200).json({ success: true, result: action.updatedstatus, status: 200 });
    req.localData = {
      store_id: action.updatedstatus.store,
      rider_id: action.updatedstatus.rider,
      order_id: action.updatedstatus.order,
      user_id: action.updatedstatus.user
    };
    next();
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //
const getAll_Deliveries = async (req, res, next) => {
  try {
    const action = await getAllDeliveries(req.query);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    return res.status(200).json({ success: true, result: action.deliveries, status: 200 });
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //
const get_DeliveryById = async (req, res, next) => {
  try {
    const { deliveryId } = req.params;
    const action = await getDeliveryById(deliveryId);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    return res.status(200).json({ success: true, result: action.delivery, status: 200 });
  } catch (error) {
    next(error);
  }
};

const review_delivery = async (req, res, next) => {
  try {
    if (req.params.deliveryId) req.body.delivery = req.params.deliveryId;

    if (req.user) {
      return res
        .status(400)
        .json({ success: false, msg: "action not allowed for user", status: 400 });
    }
    if (req.store) req.body.store = req.store.id;

    const newReview = await reviewDelivery(req.body);

    if (newReview.err) {
      return res.status(newReview.status).json({ success: false, msg: newReview.err, status: newReview.status });
    }

    res.status(200).json({ success: true, result: newReview, status: 200 });
  } catch (error) {
    next(error);
  }
};

export {
  create_Delivery, accept_Delivery, update_DeliveryStatus, complete_Delivery,
  update_RiderStatus, getAll_Deliveries, get_DeliveryById, review_delivery
};
