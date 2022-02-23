import createWaitlist from "../services/waitlist.service";

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
    return res.status(201).json({ success: true, result: action.waitlist, status: 201 });
  } catch (error) {
    next(error);
  }
};

export default create_waitlist;
