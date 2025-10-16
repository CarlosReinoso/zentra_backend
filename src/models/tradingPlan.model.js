const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const TradingSessions = {
  LONDON: 'LONDON',
  NY: 'NY',
  ASIA: 'ASIA',
};

const StopLossDisciplines = {
  ALWAYS: 'ALWAYS',
  FLEXIBLE: 'FLEXIBLE',
};

const tradingPlanSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    maxTradesPerDay: {
      type: Number,
      required: true,
      min: 0,
    },
    riskPercentPerTrade: {
      type: Number,
      required: true,
      min: 0,
    },
    targetRiskRewardRatio: {
      type: Number,
      required: true,
      min: 0,
    },
    preferredSessions: {
      type: [
        {
          type: String,
          enum: Object.values(TradingSessions),
        },
      ],
      required: true,
      default: [],
    },
    stopLossDiscipline: {
      type: String,
      enum: Object.values(StopLossDisciplines),
      required: true,
    },
  },
  { timestamps: true }
);

tradingPlanSchema.plugin(toJSON);

const TradingPlan = mongoose.model('TradingPlan', tradingPlanSchema);

module.exports = TradingPlan;
