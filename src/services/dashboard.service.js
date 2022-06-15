import Rider from "../models/rider.model";
import Order from "../models/order.model";

const riderDashboard = async (urlParams, riderId) => {
  const limit = Number(urlParams.limit);
  const skip = Number(urlParams.skip);
  let { sort } = urlParams;

  // check for sort type
  if (urlParams.sortType === "desc") sort = `-${sort}`;
  if (!urlParams.sort) sort = "createdAt";
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
  const pipeline = [
    {
      $unset: [
        "store.password",
        "store.email",
        "store.labels",
        "store.phone_number",
        "store.category",
        "store.openingTime",
        "store.closingTime",
        "product_meta.details.variants",
        "product_meta.details.store",
        "product_meta.details.category",
        "product_meta.details.label",
        "productData",
        "user.password",
        "user.cart",
      ],
    },
  ];
  let orders = Order.aggregate()
    .match({ rider: riderId })
    .lookup({
      from: "stores",
      localField: "store",
      foreignField: "_id",
      as: "store",
    })
    .lookup({
      from: "users",
      localField: "user",
      foreignField: "_id",
      as: "user",
    })
    .lookup({
      from: "riders",
      localField: "rider",
      foreignField: "_id",
      as: "rider",
    })
    .project({
      _id: 1,
      status: 1,
      deliveryPrice: 1,
      totalPrice: 1,
      taxPrice: 1,
      subtotal: 1,
      orderItems: 1,
      deliveryAddress: 1,
      "store._id": 1,
      "store.name": 1,
      "store.address": 1,
      "store.location.coordinates": 1,
      "store.images": 1,
      "user._id": 1,
      "user.first_name": 1,
      "user.last_name": 1,
      "user.phone_number": 1,
      "rider._id": 1,
      "rider.first_name": 1,
      "rider.last_name": 1,
      orderId: 1,
      createdAt: 1,
    })
    .unwind("$user")
    .append(pipeline)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  return orders;
};

export default riderDashboard;
