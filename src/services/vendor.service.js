import capitalize from "capitalize";
import Recommend from "../models/recommend-vendor.model";

const recommendVendor = async (vendorParam) => {
  const {
    name, state, email, city, instagram
  } = vendorParam;
  // if email is provided
  if (email) {
    // find the vendor has already been recommended
    const vendorExist = await Recommend.findOne({ email });
    // check for if email exist
    if (vendorExist) {
      return { err: "Vendor has already been recommended.", status: 409, };
    }
  }

  // create Waitlist for vendors
  const recommendedVendor = await Recommend.create({
    name: capitalize(name),
    email,
    state,
    city,
    instagram
  });

  return { recommendedVendor };
};

export default recommendVendor;
