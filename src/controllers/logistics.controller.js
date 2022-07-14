import * as logisticsService from "../services/logistics.service";

const getAllCompanies = async (req, res, next) => {
  try {
    const data = await logisticsService.getAllCompanies();
    // send response
    return res.status(200).json({
      success: true, result: data, status: 200
    });
  } catch (error) {
    return next(error);
  }
};

const companySignup = async (req, res, next) => {
  try {
    const action = await logisticsService.companySignup(req.body);
    // check for errors
    if (action.err) {
      return res.status(action.status).json({ success: false, result: action.err });
    }
    // send response
    res.status(201).json({
      success: true, result: action.saveAction, token: action.token, status: 201
    });

    req.data = {
      company_id: action.saveAction._id,
    };
    next();
  } catch (error) {
    return next(error);
  }
};

const companyLogin = async (req, res, next) => {
  try {
    const action = await logisticsService.companyLogin(req.body);
    // check for errors
    if (action.err) {
      return res.status(action.status).json({ success: false, result: action.err });
    }
    // send response
    res.status(200).json({
      success: true, result: action.token, status: 200
    });
  } catch (error) {
    return next(error);
  }
};

const companyDetails = async (req, res, next) => {
  try {
    const data = await logisticsService.companyDetails(req.logistics.id);
    // check for errors
    if (data.err) {
      return res.status(data.status).json({ success: false, result: data.err });
    }
    // send response
    res.status(200).json({
      success: true, result: data, status: 200
    });
  } catch (error) {
    return next(error);
  }
};

const updateCompanyAddress = async (req, res, next) => {
  try {
    const action = await logisticsService.updateCompanyAddress(req.logistics.id, req.body);
    // check for errors
    if (action.err) {
      return res.status(action.status).json({ success: false, result: action.err });
    }
    // send response
    res.status(200).json({
      success: true, result: action, status: 200
    });
  } catch (error) {
    return next(error);
  }
};

const updateLoginDetails = async (req, res, next) => {
  try {
    const action = await logisticsService.updateLoginDetails(req.logistics.id, req.body);
    // check for errors
    if (action.err) {
      return res.status(action.status).json({ success: false, result: action.err });
    }
    // send response
    res.status(200).json({
      success: true, result: action, status: 200
    });
  } catch (error) {
    return next(error);
  }
};

const updateCompanyImage = async (req, res, next) => {
  try {
    if (req.admin) {
      riderId = req.query.riderId;
    } else {
      riderId = req.logistics.id;
    }
    const action = await logisticsService.updateCompanyImage(riderId, req.body);
    // check for errors
    if (action.err) {
      return res.status(action.status).json({ success: false, result: action.err });
    }
    // send response
    res.status(200).json({
      success: true, result: action, status: 200
    });
  } catch (error) {
    return next(error);
  }
};
const updateCompanyDetails = async (req, res, next) => {
  const action = await logisticsService.updateCompanyDetails(req.logistics.id, req.body);
  // check for errors
  if (action.err) {
    return res.status(action.status).json({ success: false, result: action.err });
  }
  // send response
  res.status(200).json({
    success: true, result: action, status: 200
  });
};

const viewCompanyRiders = async (req, res, next) => {
  try {
    if (req.admin) {
      riderId = req.query.riderId;
    } else {
      riderId = req.logistics.id;
    }
    const data = await logisticsService.viewCompanyRiders(riderId, req.query);
    // check for errors
    if (data.err) {
      return res.status(data.status).json({ success: false, result: data.err });
    }
    // send response
    res.status(200).json({
      success: true, result: data, status: 200
    });
  } catch (error) {
    return next(error);
  }
};

const viewCompanyRiderDetails = async (req, res, next) => {
  try {
    const data = await logisticsService.viewCompanyRiderDetails(req.logistics.id, req.params.riderId);
    // check for errors
    if (data.err) {
      return res.status(data.status).json({ success: false, result: data.err });
    }
    // send response
    res.status(200).json({
      success: true, result: data[0], status: 200
    });
  } catch (error) {
    return next(error);
  }
};

const requestWithdrawal = async (req, res, next) => {
  try {
    const action = await logisticsService.requestWithdrawal(req.logistics.id);
    // check for errors
    if (action.err) {
      return res.status(action.status).json({ success: false, result: action.err });
    }
    // send response
    res.status(200).json({
      success: true, result: action, status: 200
    });
  } catch (error) {
    return next(error);
  }
};

const updateCompanyAccountDetails = async (req, res, next) => {
  try {
    const action = await logisticsService.updateCompanyAccountDetails(req.logistics.id, req.body);
    // check for errors
    if (action.err) {
      return res.status(action.status).json({ success: false, result: action.err });
    }
    // send response
    res.status(200).json({
      success: true, result: action, status: 200
    });
  } catch (error) {
    return next(error);
  }
};

const deleteAccount = async (req, res, next) => {
  try {
    const action = await logisticsService.deleteAccount(req.logistics.id);

    return res.status(200).json({
      success: true,
      result: action,
      status: 200
    });
  } catch (error) {
    next(error);
  }
};

export {
  companySignup, companyLogin, companyDetails, updateCompanyAddress, updateLoginDetails, updateCompanyImage, updateCompanyDetails, viewCompanyRiders, viewCompanyRiderDetails, requestWithdrawal, getAllCompanies, updateCompanyAccountDetails, deleteAccount
};
