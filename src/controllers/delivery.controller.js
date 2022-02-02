import {
  createDelivery, acceptDelivery, updatedDeliveryStatus, updatedRiderStatus,
  getAllDeliveries, getDeliveryById, completeDelivery
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
    return res.status(201).json({ success: true, result: action.delivery, status: 201 });
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
    return res.status(200).json({ success: true, result: action.updatedDelivery, status: 200 });
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
    return res.status(200).json({ success: true, result: action.updatedstatus, status: 200 });
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
    return res.status(200).json({ success: true, result: action.updatedstatus, status: 200 });
  } catch (error) {
    next(error);
  }
};

// ========================================================================== //
const getAll_Deliveries = async (req, res, next) => {
  try {
    const { _id } = req.rider;
    const action = await getAllDeliveries(_id, req.query);
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
    const { _id } = req.rider;
    const action = await getDeliveryById(deliveryId, _id);
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

export {
  create_Delivery, accept_Delivery, update_DeliveryStatus, complete_Delivery,
  update_RiderStatus, getAll_Deliveries, get_DeliveryById,
};
