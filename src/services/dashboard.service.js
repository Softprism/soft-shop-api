import Rider from "../models/rider.model";
import Order from "../models/order.model";

/**
 * @class Dashboard
 * @description Dashboard services
 * @exports Dashboard
 */
export default class DashboardServices {
  /**
   * @returns {object} An instance of the Riders class
   */
  static async getRiderDashboard(urlParams, riderId) {
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
    const orders = await Order.find()
      .sort({ createdDate: -1 }) // -1 for descending sort
      .skip(skip)
      .limit(limit);

    return { rider, orders };
  }
}
