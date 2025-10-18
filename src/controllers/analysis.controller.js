const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { analysisService } = require('../services');
const logger = require('../config/logger');

const getState = catchAsync(async (req, res) => {
  logger.info('Getting psychological state for user:', req.user.id);
  const state = await analysisService.getCurrentState(req.user.id);
  logger.info('Psychological state retrieved successfully for user:', req.user.id, 'State:', state.state);
  res.status(httpStatus.OK).send(state);
});

const getForecast = catchAsync(async (req, res) => {
  logger.info('Getting session forecast for user:', req.user.id, 'Session:', req.query.session);
  const forecast = await analysisService.getSessionForecast(req.user.id, req.query.session);
  logger.info('Session forecast retrieved successfully for user:', req.user.id, 'Forecast:', forecast.forecast);
  res.status(httpStatus.OK).send(forecast);
});

const getInsights = catchAsync(async (req, res) => {
  logger.info('Getting performance insights for user:', req.user.id, 'Period:', req.query.period);
  const insights = await analysisService.getPerformanceInsights(req.user.id, req.query.period);
  logger.info(
    'Performance insights retrieved successfully for user:',
    req.user.id,
    'Insights count:',
    insights.insights.length
  );
  res.status(httpStatus.OK).send(insights);
});

const getHistory = catchAsync(async (req, res) => {
  logger.info('Getting psychological history for user:', req.user.id);
  const filter = pick(req.query, ['startDate', 'endDate', 'limit']);
  const history = await analysisService.getStateHistory(req.user.id, filter);
  logger.info('Psychological history retrieved successfully for user:', req.user.id, 'Records:', history.history.length);
  res.status(httpStatus.OK).send(history);
});

module.exports = {
  getState,
  getForecast,
  getInsights,
  getHistory,
};
