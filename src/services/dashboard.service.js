import Rider from "../models/rider.model";
import Order from "../models/order.model";

const riderDashboard = async (urlParams, riderId) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);

  delete urlParams.limit;
  delete urlParams.skip;
  delete urlParams.page;

  const rider = await Rider.find(riderId).select("-password");
  if (!rider) {
    return {
      err: "Rider does not exists.",
      status: 404,
    };
  }
  const orders = await Order.find({ rider: riderId }).select("orderItems deliveryAddress").populate([
    { path: "store", select: "_id name address location" },
    { path: "user", select: "_id first_name last_name phone_number " },
  ])
    .sort({ createdDate: -1 }) // -1 for descending sort
    .skip(skip)
    .limit(limit);

  let dashboard = [];

  dashboard = orders.map((order) => {
    return {
      order: {
        _id: order._id,
        orderItems: order.orderItems,
        deliveryAddress: order.deliveryAddress,
      },
      store: {
        _id: order.store._id,
        name: order.store.name,
        address: order.store.address,
        lat: order.store.location.coordinates[1],
        long: order.store.location.coordinates[0]
      },
      user: {
        _id: order.user._id,
        first_name: order.user.first_name,
        last_name: order.user.last_name,
        phone_number: order.user.phone_number
      }
    };
  });

  return {
    dashboard
  };
};

export default riderDashboard;
