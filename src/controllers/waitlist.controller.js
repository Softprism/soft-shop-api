import createWaitlist from "../services/waitlist.service";
import { sendWaitListSignupMail } from "../utils/sendMail";

// ========================================================================== //
const create_waitlist = async (req, res, next) => {
  try {
    const action = await createWaitlist(req.body);
    if (action.err) {
      return res
        .status(action.status)
        .json({
          success: false, msg: action.err, status: action.status
        });
    }
    res.status(201).json({ success: true, result: action.waitlist, status: 201 });
    // send waitlist email
    await sendWaitListSignupMail(action.waitlist.email);
  } catch (error) {
    next(error);
  }
};

export default create_waitlist;
