const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { tradingPlanService } = require('../services');
const logger = require('../config/logger');

const createTradingPlan = catchAsync(async (req, res) => {
  logger.info('Creating trading plan for user:', req.user.id);
  const tradingPlan = await tradingPlanService.createOrUpdateTradingPlan(req.user.id, req.body);
  logger.info('Trading plan created/updated successfully:', tradingPlan.id);
  res.status(httpStatus.CREATED).send(tradingPlan);
});

const getTradingPlan = catchAsync(async (req, res) => {
  logger.info('Getting trading plan for user:', req.user.id);
  const tradingPlan = await tradingPlanService.getTradingPlanByUserId(req.user.id);
  if (!tradingPlan) {
    logger.info('No trading plan found for user:', req.user.id);
    throw new ApiError(httpStatus.NOT_FOUND, 'Trading plan not found');
  }
  logger.info('Trading plan retrieved successfully:', tradingPlan.id);
  res.send(tradingPlan);
});

const deleteTradingPlan = catchAsync(async (req, res) => {
  logger.info('Deleting trading plan for user:', req.user.id);
  await tradingPlanService.deleteTradingPlanByUserId(req.user.id);
  logger.info('Trading plan deleted successfully for user:', req.user.id);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createTradingPlan,
  getTradingPlan,
  deleteTradingPlan,
};
