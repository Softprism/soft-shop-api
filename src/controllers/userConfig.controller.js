import * as userConfigService from "../services/userConfig.service";

const createUserConfig = async (req, res, next) => {
  try {
    const response = await userConfigService.createUserConfig(req.body);
    res
      .status(201)
      .json({
        success: true, result: response, status: 201
      });
  } catch (error) {
    next(error);
  }
};

const updateUserFee = async (req, res, next) => {
  try {
    const response = await userConfigService.updateUserFee(req.params.userId, req.body.fee); res
      .status(201)
      .json({
        success: true, result: response, status: 200
      });
  } catch (error) {
    next(error);
  }
};

export {
  createUserConfig,
  updateUserFee
};
