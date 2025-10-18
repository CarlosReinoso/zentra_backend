const { Trade } = require('../models');
const { analysisService } = require('./index');
const logger = require('../config/logger');

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
 * Calculate summary statistics
 * @param {Array} trades
 * @returns {Object}
 */
const calculateSummaryStats = (trades) => {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalProfitLoss: 0,
      averageRiskReward: 0,
      bestTrade: 0,
      worstTrade: 0,
    };
  }

  const totalTrades = trades.length;
  const winningTrades = trades.filter((t) => t.profitLoss > 0).length;
  const losingTrades = trades.filter((t) => t.profitLoss < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalProfitLoss = trades.reduce((sum, t) => sum + t.profitLoss, 0);
  const averageRiskReward = trades.reduce((sum, t) => sum + t.riskRewardAchieved, 0) / totalTrades;
  const profits = trades.map((t) => t.profitLoss);
  const bestTrade = Math.max(...profits);
  const worstTrade = Math.min(...profits);

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate: Math.round(winRate * 100) / 100,
    totalProfitLoss: Math.round(totalProfitLoss * 100) / 100,
    averageRiskReward: Math.round(averageRiskReward * 100) / 100,
    bestTrade: Math.round(bestTrade * 100) / 100,
    worstTrade: Math.round(worstTrade * 100) / 100,
  };
};

/**
 * Calculate daily P&L
 * @param {Array} trades
 * @returns {Array}
 */
const calculateDailyPnL = (trades) => {
  const dailyPnL = {};

  trades.forEach((trade) => {
    const date = new Date(trade.entryTime).toISOString().split('T')[0];
    if (!dailyPnL[date]) {
      dailyPnL[date] = 0;
    }
    dailyPnL[date] += trade.profitLoss;
  });

  return Object.entries(dailyPnL)
    .map(([date, profitLoss]) => ({
      date,
      profitLoss: Math.round(profitLoss * 100) / 100,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));
};

/**
 * Calculate session performance
 * @param {Array} trades
 * @returns {Array}
 */
const calculateSessionPerformance = (trades) => {
  const sessionStats = {};

  trades.forEach((trade) => {
    const { session } = trade;
    if (!sessionStats[session]) {
      sessionStats[session] = {
        trades: 0,
        profitLoss: 0,
        winningTrades: 0,
      };
    }
    sessionStats[session].trades += 1;
    sessionStats[session].profitLoss += trade.profitLoss;
    if (trade.profitLoss > 0) {
      sessionStats[session].winningTrades += 1;
    }
  });

  return Object.entries(sessionStats).map(([session, stats]) => ({
    session,
    trades: stats.trades,
    profitLoss: Math.round(stats.profitLoss * 100) / 100,
    winRate: Math.round((stats.winningTrades / stats.trades) * 100 * 100) / 100,
  }));
};

/**
 * Calculate risk metrics
 * @param {Array} trades
 * @returns {Object}
 */
const calculateRiskMetrics = (trades) => {
  if (trades.length === 0) {
    return {
      averageRiskPerTrade: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
    };
  }

  const averageRiskPerTrade = trades.reduce((sum, t) => sum + t.riskPercentUsed, 0) / trades.length;

  // Calculate max drawdown
  let peak = 0;
  let maxDrawdown = 0;
  let runningPnL = 0;

  trades.forEach((trade) => {
    runningPnL += trade.profitLoss;
    if (runningPnL > peak) {
      peak = runningPnL;
    }
    const drawdown = peak - runningPnL;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  });

  // Calculate Sharpe ratio (simplified)
  const returns = trades.map((t) => t.profitLoss);
  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + (r - avgReturn) ** 2, 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

  return {
    averageRiskPerTrade: Math.round(averageRiskPerTrade * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
  };
};

/**
 * Calculate trends
 * @param {Array} trades
 * @param {string} period
 * @returns {Object}
 */
const calculateTrends = (trades) => {
  if (trades.length < 2) {
    return {
      pnlTrend: 'STABLE',
      winRateTrend: 'STABLE',
      riskTrend: 'STABLE',
    };
  }

  // Split trades into two halves for comparison
  const midPoint = Math.floor(trades.length / 2);
  const firstHalf = trades.slice(0, midPoint);
  const secondHalf = trades.slice(midPoint);

  // P&L trend
  const firstHalfPnL = firstHalf.reduce((sum, t) => sum + t.profitLoss, 0);
  const secondHalfPnL = secondHalf.reduce((sum, t) => sum + t.profitLoss, 0);
  let pnlTrend = 'STABLE';
  if (secondHalfPnL > firstHalfPnL) {
    pnlTrend = 'UP';
  } else if (secondHalfPnL < firstHalfPnL) {
    pnlTrend = 'DOWN';
  }

  // Win rate trend
  const firstHalfWinRate = firstHalf.filter((t) => t.profitLoss > 0).length / firstHalf.length;
  const secondHalfWinRate = secondHalf.filter((t) => t.profitLoss > 0).length / secondHalf.length;
  let winRateTrend = 'STABLE';
  if (secondHalfWinRate > firstHalfWinRate) {
    winRateTrend = 'UP';
  } else if (secondHalfWinRate < firstHalfWinRate) {
    winRateTrend = 'DOWN';
  }

  // Risk trend
  const firstHalfRisk = firstHalf.reduce((sum, t) => sum + t.riskPercentUsed, 0) / firstHalf.length;
  const secondHalfRisk = secondHalf.reduce((sum, t) => sum + t.riskPercentUsed, 0) / secondHalf.length;
  let riskTrend = 'STABLE';
  if (secondHalfRisk > firstHalfRisk) {
    riskTrend = 'UP';
  } else if (secondHalfRisk < firstHalfRisk) {
    riskTrend = 'DOWN';
  }

  return {
    pnlTrend,
    winRateTrend,
    riskTrend,
  };
};

/**
 * Generate alerts based on trading data
 * @param {Array} trades
 * @param {Object} psychologicalState
 * @returns {Array}
 */
const generateAlerts = (trades, psychologicalState) => {
  const alerts = [];

  if (trades.length === 0) {
    return alerts;
  }

  // Calculate metrics for alerts
  const winRate = trades.filter((t) => t.profitLoss > 0).length / trades.length;
  const avgRisk = trades.reduce((sum, t) => sum + t.riskPercentUsed, 0) / trades.length;
  const recentTrades = trades.slice(-5); // Last 5 trades
  const recentWinRate = recentTrades.filter((t) => t.profitLoss > 0).length / recentTrades.length;

  // Win rate alerts
  if (winRate >= 0.7) {
    alerts.push({
      type: 'SUCCESS',
      message: 'Excellent win rate achieved',
      priority: 'MEDIUM',
    });
  } else if (winRate <= 0.3) {
    alerts.push({
      type: 'WARNING',
      message: 'Low win rate - review trading strategy',
      priority: 'HIGH',
    });
  }

  // Risk management alerts
  if (avgRisk > 3) {
    alerts.push({
      type: 'WARNING',
      message: 'Risk per trade above recommended level',
      priority: 'HIGH',
    });
  } else if (avgRisk < 1) {
    alerts.push({
      type: 'INFO',
      message: 'Consider increasing position sizes gradually',
      priority: 'LOW',
    });
  }

  // Recent performance alerts
  if (recentWinRate > winRate + 0.2) {
    alerts.push({
      type: 'SUCCESS',
      message: 'Recent performance showing improvement',
      priority: 'MEDIUM',
    });
  } else if (recentWinRate < winRate - 0.2) {
    alerts.push({
      type: 'WARNING',
      message: 'Recent performance declining',
      priority: 'HIGH',
    });
  }

  // Psychological state alerts
  if (psychologicalState.state === 'GREEDY') {
    alerts.push({
      type: 'WARNING',
      message: 'High risk tolerance detected - reduce position sizes',
      priority: 'HIGH',
    });
  } else if (psychologicalState.state === 'FEARFUL') {
    alerts.push({
      type: 'INFO',
      message: 'Low confidence detected - consider taking a break',
      priority: 'MEDIUM',
    });
  }

  return alerts;
};

/**
 * Get complete dashboard data
 * @param {ObjectId} userId
 * @param {string} period
 * @returns {Promise<Object>}
 */
const getCompleteDashboard = async (userId, period = 'MONTH') => {
  logger.info('Service: Getting complete dashboard for user:', userId, 'Period:', period);

  // Get date range
  const dateRange = getDateRange(period);

  // Get trades for the period
  const trades = await Trade.find({
    userId,
    entryTime: { $gte: dateRange.start, $lte: dateRange.end },
  })
    .sort({ entryTime: -1 })
    .lean();

  logger.info('Service: Found trades for dashboard:', trades.length);

  // Get psychological state
  const psychologicalState = await analysisService.getCurrentState(userId);

  // Get performance insights
  const insights = await analysisService.getPerformanceInsights(userId, period);

  // Calculate metrics
  const summary = calculateSummaryStats(trades);
  const dailyPnL = calculateDailyPnL(trades);
  const sessionPerformance = calculateSessionPerformance(trades);
  const riskMetrics = calculateRiskMetrics(trades);

  // Get recent trades (last 10)
  const recentTrades = trades.slice(0, 10).map((trade) => ({
    id: trade._id,
    entryTime: trade.entryTime,
    exitTime: trade.exitTime,
    profitLoss: trade.profitLoss,
    session: trade.session,
    riskPercentUsed: trade.riskPercentUsed,
    riskRewardAchieved: trade.riskRewardAchieved,
  }));

  const dashboard = {
    period,
    summary,
    psychologicalState,
    performance: {
      dailyPnL,
      sessionPerformance,
      riskMetrics,
    },
    insights: insights.insights,
    recentTrades,
  };

  logger.info('Service: Dashboard data compiled successfully');
  return dashboard;
};

/**
 * Get dashboard summary
 * @param {ObjectId} userId
 * @param {string} period
 * @returns {Promise<Object>}
 */
const getDashboardSummary = async (userId, period = 'MONTH') => {
  logger.info('Service: Getting dashboard summary for user:', userId, 'Period:', period);

  // Get date range
  const dateRange = getDateRange(period);

  // Get trades for the period
  const trades = await Trade.find({
    userId,
    entryTime: { $gte: dateRange.start, $lte: dateRange.end },
  })
    .sort({ entryTime: -1 })
    .lean();

  logger.info('Service: Found trades for summary:', trades.length);

  // Get psychological state
  const psychologicalState = await analysisService.getCurrentState(userId);

  // Calculate quick stats
  const summaryStats = calculateSummaryStats(trades);
  const quickStats = {
    totalTrades: summaryStats.totalTrades,
    winRate: summaryStats.winRate,
    totalPnL: summaryStats.totalProfitLoss,
    avgRiskReward: summaryStats.averageRiskReward,
    currentState: psychologicalState.state,
    confidence: psychologicalState.confidence,
  };

  // Calculate trends
  const trends = calculateTrends(trades);

  // Generate alerts
  const alerts = generateAlerts(trades, psychologicalState);

  const summary = {
    period,
    quickStats,
    trends,
    alerts,
  };

  logger.info('Service: Dashboard summary compiled successfully');
  return summary;
};

module.exports = {
  getCompleteDashboard,
  getDashboardSummary,
};
