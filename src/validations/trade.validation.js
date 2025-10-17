const Joi = require('joi');

const createTrade = {
  body: Joi.object().keys({
    entryTime: Joi.date().required(),
    exitTime: Joi.date().required(),
    riskPercentUsed: Joi.number().min(0).required(),
    profitLoss: Joi.number().required(),
    riskRewardAchieved: Joi.number().min(0).required(),
    session: Joi.string().valid('LONDON', 'NY', 'ASIA').required(),
    stopLossHit: Joi.boolean().required(),
    exitedEarly: Joi.boolean().required(),
    targetPercentAchieved: Joi.number().min(0).required(),
    notes: Joi.string().allow('').optional(),
  }),
};

const createBulkTrades = {
  body: Joi.object().keys({
    trades: Joi.array()
      .items(
        Joi.object().keys({
          entryTime: Joi.date().required(),
          exitTime: Joi.date().required(),
          riskPercentUsed: Joi.number().min(0).required(),
          profitLoss: Joi.number().required(),
          riskRewardAchieved: Joi.number().min(0).required(),
          session: Joi.string().valid('LONDON', 'NY', 'ASIA').required(),
          stopLossHit: Joi.boolean().required(),
          exitedEarly: Joi.boolean().required(),
          targetPercentAchieved: Joi.number().min(0).required(),
          notes: Joi.string().allow('').optional(),
        })
      )
      .min(1)
      .required(),
  }),
};

const getTrades = {
  query: Joi.object().keys({
    session: Joi.string().valid('LONDON', 'NY', 'ASIA'),
    entryTime: Joi.date(),
    exitTime: Joi.date(),
    stopLossHit: Joi.boolean(),
    exitedEarly: Joi.boolean(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTrade = {
  params: Joi.object().keys({
    tradeId: Joi.string().required(),
  }),
};

const updateTrade = {
  params: Joi.object().keys({
    tradeId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      entryTime: Joi.date(),
      exitTime: Joi.date(),
      riskPercentUsed: Joi.number().min(0),
      profitLoss: Joi.number(),
      riskRewardAchieved: Joi.number().min(0),
      session: Joi.string().valid('LONDON', 'NY', 'ASIA'),
      stopLossHit: Joi.boolean(),
      exitedEarly: Joi.boolean(),
      targetPercentAchieved: Joi.number().min(0),
      notes: Joi.string().allow(''),
    })
    .min(1),
};

const deleteTrade = {
  params: Joi.object().keys({
    tradeId: Joi.string().required(),
  }),
};

module.exports = {
  createTrade,
  createBulkTrades,
  getTrades,
  getTrade,
  updateTrade,
  deleteTrade,
};
