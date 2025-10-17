const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const { TradingSessions } = require('./enums');

const tradeSchema = mongoose.Schema(
  {
    userId: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    entryTime: {
      type: Date,
      required: true,
    },
    exitTime: {
      type: Date,
      required: true,
    },
    riskPercentUsed: {
      type: Number,
      required: true,
      min: 0,
    },
    profitLoss: {
      type: Number,
      required: true,
    },
    riskRewardAchieved: {
      type: Number,
      required: true,
      min: 0,
    },
    session: {
      type: String,
      enum: Object.values(TradingSessions),
      required: true,
    },
    stopLossHit: {
      type: Boolean,
      required: true,
    },
    exitedEarly: {
      type: Boolean,
      required: true,
    },
    targetPercentAchieved: {
      type: Number,
      required: true,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Add indexes for better query performance
tradeSchema.index({ userId: 1, entryTime: -1 });
tradeSchema.index({ session: 1, entryTime: -1 });
tradeSchema.index({ entryTime: -1 });

tradeSchema.plugin(toJSON);
tradeSchema.plugin(paginate);

const Trade = mongoose.model('Trade', tradeSchema);

module.exports = Trade;
