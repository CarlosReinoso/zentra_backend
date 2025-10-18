const { Trade } = require('../models');
const logger = require('../config/logger');

/**
 * Analyze psychological state from recent trades
 * @param {Array} trades
 * @returns {Object}
 */
const analyzePsychologicalState = (trades) => {
  if (trades.length === 0) {
    return {
      state: 'NEUTRAL',
      confidence: 50,
      riskTolerance: 50,
      emotionalBalance: 50,
      lastUpdated: new Date().toISOString(),
      recommendations: ['Start trading to build psychological profile'],
    };
  }

  // Calculate basic metrics
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.profitLoss > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

  // Calculate average metrics
  const avgRiskUsed = trades.reduce((sum, t) => sum + t.riskPercentUsed, 0) / totalTrades;
  const avgTargetAchieved = trades.reduce((sum, t) => sum + t.targetPercentAchieved, 0) / totalTrades;

  // Determine psychological state based on metrics
  let state = 'NEUTRAL';
  let confidence = 50;
  let riskTolerance = 50;
  let emotionalBalance = 50;
  const recommendations = [];

  // Analyze win rate impact
  if (winRate >= 70) {
    state = 'CONFIDENT';
    confidence = Math.min(95, 50 + (winRate - 50) * 0.9);
    riskTolerance = Math.min(80, 50 + (winRate - 50) * 0.6);
  } else if (winRate <= 30) {
    state = 'FRUSTRATED';
    confidence = Math.max(20, 50 - (50 - winRate) * 0.6);
    riskTolerance = Math.max(20, 50 - (50 - winRate) * 0.6);
  }

  // Analyze risk management
  if (avgRiskUsed > 3) {
    state = 'GREEDY';
    riskTolerance = Math.min(90, riskTolerance + 20);
    recommendations.push('Reduce risk per trade');
  } else if (avgRiskUsed < 1) {
    state = 'FEARFUL';
    riskTolerance = Math.max(10, riskTolerance - 20);
    recommendations.push('Consider increasing position size gradually');
  }

  // Analyze discipline
  const earlyExits = trades.filter((t) => t.exitedEarly).length;
  const stopLossHits = trades.filter((t) => t.stopLossHit).length;

  if (earlyExits / totalTrades > 0.3) {
    emotionalBalance = Math.max(30, emotionalBalance - 20);
    recommendations.push('Work on holding profitable trades longer');
  }

  if (stopLossHits / totalTrades > 0.4) {
    emotionalBalance = Math.max(30, emotionalBalance - 15);
    recommendations.push('Review entry strategies and market analysis');
  }

  // Analyze target achievement
  if (avgTargetAchieved < 50) {
    recommendations.push('Improve trade management and target setting');
  }

  // Default recommendations if none generated
  if (recommendations.length === 0) {
    recommendations.push('Continue current trading approach');
  }

  return {
    state,
    confidence: Math.round(confidence),
    riskTolerance: Math.round(riskTolerance),
    emotionalBalance: Math.round(emotionalBalance),
    lastUpdated: new Date().toISOString(),
    recommendations,
  };
};

/**
 * Analyze session forecast
 * @param {Array} trades
 * @param {string} session
 * @returns {Object}
 */
const analyzeSessionForecast = (trades, session) => {
  if (trades.length === 0) {
    return {
      session: session.toUpperCase(),
      forecast: 'NEUTRAL',
      probability: 50,
      factors: [
        {
          factor: 'No historical data',
          impact: 'NEUTRAL',
          weight: 1.0,
        },
      ],
      recommendations: ['Start trading this session to build forecast data'],
    };
  }

  // Calculate session-specific metrics
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.profitLoss > 0).length;
  const winRate = (winningTrades / totalTrades) * 100;
  const avgProfit = trades.reduce((sum, t) => sum + t.profitLoss, 0) / totalTrades;

  // Determine forecast based on historical performance
  let forecast = 'NEUTRAL';
  let probability = 50;
  const factors = [];
  const recommendations = [];

  // Win rate factor
  if (winRate >= 60) {
    factors.push({
      factor: 'Historical win rate',
      impact: 'POSITIVE',
      weight: 0.4,
    });
    probability += 20;
  } else if (winRate <= 40) {
    factors.push({
      factor: 'Historical win rate',
      impact: 'NEGATIVE',
      weight: 0.4,
    });
    probability -= 20;
  }

  // Profit factor
  if (avgProfit > 0) {
    factors.push({
      factor: 'Average profitability',
      impact: 'POSITIVE',
      weight: 0.3,
    });
    probability += 15;
  } else {
    factors.push({
      factor: 'Average profitability',
      impact: 'NEGATIVE',
      weight: 0.3,
    });
    probability -= 15;
  }

  // Risk management factor
  const avgRisk = trades.reduce((sum, t) => sum + t.riskPercentUsed, 0) / totalTrades;
  if (avgRisk <= 2) {
    factors.push({
      factor: 'Risk management',
      impact: 'POSITIVE',
      weight: 0.3,
    });
    probability += 10;
  } else {
    factors.push({
      factor: 'Risk management',
      impact: 'NEGATIVE',
      weight: 0.3,
    });
    probability -= 10;
  }

  // Determine forecast
  if (probability >= 65) {
    forecast = 'POSITIVE';
  } else if (probability <= 35) {
    forecast = 'NEGATIVE';
  }

  // Generate recommendations
  if (forecast === 'POSITIVE') {
    recommendations.push('Consider increasing position size');
    recommendations.push('Focus on high-probability setups');
  } else if (forecast === 'NEGATIVE') {
    recommendations.push('Reduce position sizes');
    recommendations.push('Be more selective with entries');
  } else {
    recommendations.push('Trade with normal position sizes');
    recommendations.push('Monitor market conditions closely');
  }

  return {
    session: session.toUpperCase(),
    forecast,
    probability: Math.max(0, Math.min(100, probability)),
    factors,
    recommendations,
  };
};

/**
 * Get date range for period
 * @param {string} period
 * @returns {Object}
 */
const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case 'WEEK':
      start.setDate(now.getDate() - 7);
      break;
    case 'MONTH':
      start.setMonth(now.getMonth() - 1);
      break;
    case 'QUARTER':
      start.setMonth(now.getMonth() - 3);
      break;
    case 'YEAR':
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
  }

  return { start, end: now };
};

/**
 * Analyze performance insights
 * @param {Array} trades
 * @param {string} period
 * @returns {Object}
 */
const analyzePerformanceInsights = (trades, period) => {
  if (trades.length === 0) {
    return {
      period,
      insights: [
        {
          type: 'OPPORTUNITY',
          description: 'No trading data available for analysis',
          confidence: 100,
          impact: 'LOW',
        },
      ],
      patterns: [],
      recommendations: ['Start trading to generate performance insights'],
    };
  }

  const insights = [];
  const patterns = [];
  const recommendations = [];

  // Calculate basic metrics
  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.profitLoss > 0).length;
  const winRate = (winningTrades / totalTrades) * 100;
  const avgRisk = trades.reduce((sum, t) => sum + t.riskPercentUsed, 0) / totalTrades;
  const avgRiskReward = trades.reduce((sum, t) => sum + t.riskRewardAchieved, 0) / totalTrades;

  // Win rate insights
  if (winRate >= 70) {
    insights.push({
      type: 'STRENGTH',
      description: 'Excellent win rate indicates strong market analysis skills',
      confidence: Math.round(winRate),
      impact: 'HIGH',
    });
  } else if (winRate <= 30) {
    insights.push({
      type: 'WEAKNESS',
      description: 'Low win rate suggests need for better entry strategies',
      confidence: Math.round(100 - winRate),
      impact: 'HIGH',
    });
    recommendations.push('Review entry criteria and market analysis');
  }

  // Risk management insights
  if (avgRisk <= 2) {
    insights.push({
      type: 'STRENGTH',
      description: 'Consistent risk management shows good discipline',
      confidence: 85,
      impact: 'HIGH',
    });
  } else if (avgRisk > 3) {
    insights.push({
      type: 'WEAKNESS',
      description: 'High risk per trade may lead to account blowouts',
      confidence: 80,
      impact: 'HIGH',
    });
    recommendations.push('Reduce risk per trade to protect capital');
  }

  // Risk-reward insights
  if (avgRiskReward >= 1.5) {
    insights.push({
      type: 'STRENGTH',
      description: 'Good risk-reward ratios maximize profit potential',
      confidence: 75,
      impact: 'MEDIUM',
    });
  } else if (avgRiskReward < 1) {
    insights.push({
      type: 'WEAKNESS',
      description: 'Poor risk-reward ratios limit profit potential',
      confidence: 70,
      impact: 'MEDIUM',
    });
    recommendations.push('Focus on trades with better risk-reward ratios');
  }

  // Pattern analysis
  const earlyExits = trades.filter((t) => t.exitedEarly).length;
  const stopLossHits = trades.filter((t) => t.stopLossHit).length;

  if (earlyExits / totalTrades > 0.3) {
    patterns.push({
      pattern: 'Early exit on profitable trades',
      frequency: Math.round((earlyExits / totalTrades) * 100),
      correlation: -0.3,
    });
    recommendations.push('Practice holding winners longer');
  }

  if (stopLossHits / totalTrades > 0.4) {
    patterns.push({
      pattern: 'Frequent stop loss hits',
      frequency: Math.round((stopLossHits / totalTrades) * 100),
      correlation: -0.5,
    });
    recommendations.push('Improve entry timing and market analysis');
  }

  // Session analysis
  const sessionCounts = {};
  trades.forEach((trade) => {
    sessionCounts[trade.session] = (sessionCounts[trade.session] || 0) + 1;
  });

  const bestSession = Object.keys(sessionCounts).reduce((a, b) => (sessionCounts[a] > sessionCounts[b] ? a : b));

  if (sessionCounts[bestSession] / totalTrades > 0.5) {
    insights.push({
      type: 'OPPORTUNITY',
      description: `Strong performance in ${bestSession} session`,
      confidence: 70,
      impact: 'MEDIUM',
    });
  }

  // Default recommendations if none generated
  if (recommendations.length === 0) {
    recommendations.push('Continue current trading approach');
    recommendations.push('Monitor performance metrics regularly');
  }

  return {
    period,
    insights,
    patterns,
    recommendations,
  };
};

/**
 * Get state trigger description
 * @param {Object} trade
 * @returns {string}
 */
const getStateTrigger = (trade) => {
  if (trade.profitLoss > 0) {
    return 'Profitable trade';
  }
  if (trade.profitLoss < 0) {
    return 'Losing trade';
  }
  if (trade.exitedEarly) {
    return 'Early exit';
  }
  if (trade.stopLossHit) {
    return 'Stop loss hit';
  }
  return 'Trade execution';
};

/**
 * Analyze state history
 * @param {Array} trades
 * @param {number} limit
 * @returns {Object}
 */
const analyzeStateHistory = (trades, limit) => {
  if (trades.length === 0) {
    return {
      history: [],
      summary: {
        totalChanges: 0,
        mostCommonState: 'NEUTRAL',
        averageConfidence: 50,
        volatility: 0,
      },
    };
  }

  // Group trades by time periods and analyze state changes
  const history = [];
  const states = [];
  const confidences = [];

  // Analyze trades in chronological order
  const sortedTrades = trades.sort((a, b) => new Date(a.entryTime) - new Date(b.entryTime));

  // Create state snapshots for significant events
  let lastState = null;
  let stateChangeCount = 0;

  for (let i = 0; i < sortedTrades.length && history.length < limit; i += 1) {
    const trade = sortedTrades[i];
    const recentTrades = sortedTrades.slice(Math.max(0, i - 4), i + 1);
    const state = analyzePsychologicalState(recentTrades);

    // Only record state changes or significant events
    if (!lastState || lastState.state !== state.state || Math.abs(lastState.confidence - state.confidence) > 15) {
      history.push({
        timestamp: trade.entryTime,
        state: state.state,
        confidence: state.confidence,
        trigger: getStateTrigger(trade),
        context: {
          tradeId: trade._id,
          profitLoss: trade.profitLoss,
          riskPercentUsed: trade.riskPercentUsed,
        },
      });

      states.push(state.state);
      confidences.push(state.confidence);
      stateChangeCount += 1;
      lastState = state;
    }
  }

  // Calculate summary statistics
  const stateCounts = {};
  states.forEach((state) => {
    stateCounts[state] = (stateCounts[state] || 0) + 1;
  });

  const mostCommonState = Object.keys(stateCounts).reduce((a, b) => (stateCounts[a] > stateCounts[b] ? a : b));

  const averageConfidence =
    confidences.length > 0 ? Math.round(confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length) : 50;

  // Calculate volatility (standard deviation of confidence)
  const variance =
    confidences.length > 0
      ? confidences.reduce((sum, conf) => sum + (conf - averageConfidence) ** 2, 0) / confidences.length
      : 0;
  const volatility = Math.round((Math.sqrt(variance) / 100) * 100) / 100;

  return {
    history: history.slice(0, limit),
    summary: {
      totalChanges: stateChangeCount,
      mostCommonState,
      averageConfidence,
      volatility,
    },
  };
};

/**
 * Get current psychological state
 * @param {ObjectId} userId
 * @returns {Promise<Object>}
 */
const getCurrentState = async (userId) => {
  logger.info('Service: Getting current psychological state for user:', userId);

  // Get recent trades for analysis
  const recentTrades = await Trade.find({ userId }).sort({ entryTime: -1 }).limit(10).lean();

  logger.info('Service: Found recent trades for analysis:', recentTrades.length);

  // Analyze recent performance to determine psychological state
  const state = analyzePsychologicalState(recentTrades);

  logger.info('Service: Calculated psychological state:', state.state);
  return state;
};

/**
 * Get session forecast
 * @param {ObjectId} userId
 * @param {string} session
 * @returns {Promise<Object>}
 */
const getSessionForecast = async (userId, session = 'LONDON') => {
  logger.info('Service: Getting session forecast for user:', userId, 'Session:', session);

  // Get trades for the specified session
  const sessionTrades = await Trade.find({
    userId,
    session: session.toUpperCase(),
  })
    .sort({ entryTime: -1 })
    .limit(20)
    .lean();

  logger.info('Service: Found session trades for forecast:', sessionTrades.length);

  // Analyze session performance and create forecast
  const forecast = analyzeSessionForecast(sessionTrades, session);

  logger.info('Service: Calculated session forecast:', forecast.forecast);
  return forecast;
};

/**
 * Get performance insights
 * @param {ObjectId} userId
 * @param {string} period
 * @returns {Promise<Object>}
 */
const getPerformanceInsights = async (userId, period = 'MONTH') => {
  logger.info('Service: Getting performance insights for user:', userId, 'Period:', period);

  // Calculate date range based on period
  const dateRange = getDateRange(period);

  // Get trades for the specified period
  const periodTrades = await Trade.find({
    userId,
    entryTime: { $gte: dateRange.start, $lte: dateRange.end },
  })
    .sort({ entryTime: -1 })
    .lean();

  logger.info('Service: Found period trades for insights:', periodTrades.length);

  // Analyze performance patterns and generate insights
  const insights = analyzePerformanceInsights(periodTrades, period);

  logger.info('Service: Generated insights count:', insights.insights.length);
  return insights;
};

/**
 * Get state history
 * @param {ObjectId} userId
 * @param {Object} filter
 * @returns {Promise<Object>}
 */
const getStateHistory = async (userId, filter = {}) => {
  logger.info('Service: Getting state history for user:', userId, 'Filter:', filter);

  const { startDate, endDate, limit = 50 } = filter;

  // Build date filter
  const dateFilter = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);

  // Get trades for history analysis
  const query = { userId };
  if (Object.keys(dateFilter).length > 0) {
    query.entryTime = dateFilter;
  }

  const trades = await Trade.find(query)
    .sort({ entryTime: -1 })
    .limit(limit * 2) // Get more trades to analyze state changes
    .lean();

  logger.info('Service: Found trades for history analysis:', trades.length);

  // Analyze state changes over time
  const history = analyzeStateHistory(trades, limit);

  logger.info('Service: Generated history records:', history.history.length);
  return history;
};

module.exports = {
  getCurrentState,
  getSessionForecast,
  getPerformanceInsights,
  getStateHistory,
};
