import Waitlist from "../models/waitlist.model";

const createWaitlist = async (waitlistParam) => {
  const { email } = waitlistParam;
  // find the Waitlist
  const waitlistExist = await Waitlist.findOne({ email });
  // check for if email exist
  if (waitlistExist) {
    return { err: "You have already been added to the waitlist.", status: 409, };
  }
  // create Waitlist
  const waitlist = await Waitlist.create({ email });

  return { waitlist };
};

export default createWaitlist;
