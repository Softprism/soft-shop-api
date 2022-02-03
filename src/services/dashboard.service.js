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
  const orders = await Order.find({ rider: riderId }).select("orderItems").populate([
    { path: "store", select: "_id name address location" },
    { path: "user", select: "_id first_name last_name phone_number address" },
  ])
    .sort({ createdDate: -1 }) // -1 for descending sort
    .skip(skip)
    .limit(limit);

  return { rider, orders };
};

export default riderDashboard;
