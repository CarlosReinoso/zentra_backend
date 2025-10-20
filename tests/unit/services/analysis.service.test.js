const mongoose = require('mongoose');
const { analysisService } = require('../../../src/services');
const { StateAnalysis } = require('../../../src/models');
const { tradeOne, tradeTwo, insertTrades } = require('../../fixtures/trade.fixture');
const setupTestDB = require('../../utils/setupTestDB');

setupTestDB();

describe('Analysis service', () => {
  describe('getCurrentState', () => {
    test('should return neutral state when no trades exist', async () => {
      const userId = mongoose.Types.ObjectId();

      const result = await analysisService.getCurrentState(userId);

      expect(result).toEqual({
        state: 'NEUTRAL',
        confidence: 50,
        riskTolerance: 50,
        emotionalBalance: 50,
        lastUpdated: expect.any(String),
        recommendations: ['Start trading to build psychological profile'],
      });
    });

    test('should analyze psychological state from recent trades', async () => {
      const userId = mongoose.Types.ObjectId();
      const recentTrades = [
        {
          ...tradeOne,
          userId,
          profitLoss: 150.0,
          riskPercentUsed: 2.0,
          targetPercentAchieved: 100.0,
          exitedEarly: false,
          stopLossHit: false,
        },
        {
          ...tradeTwo,
          userId,
          profitLoss: -75.0,
          riskPercentUsed: 1.5,
          targetPercentAchieved: 0.0,
          exitedEarly: false,
          stopLossHit: true,
        },
      ];

      await insertTrades(recentTrades);

      const result = await analysisService.getCurrentState(userId);

      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('confidence');
      expect(result).toHaveProperty('riskTolerance');
      expect(result).toHaveProperty('emotionalBalance');
      expect(result).toHaveProperty('lastUpdated');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    test('should identify confident state with high win rate', async () => {
      const userId = mongoose.Types.ObjectId();
      const winningTrades = Array.from({ length: 8 }, () => ({
        ...tradeOne,
        userId,
        _id: mongoose.Types.ObjectId(),
        profitLoss: 100.0,
        riskPercentUsed: 2.0,
        targetPercentAchieved: 100.0,
        exitedEarly: false,
        stopLossHit: false,
      }));

      const losingTrades = Array.from({ length: 2 }, () => ({
        ...tradeTwo,
        userId,
        _id: mongoose.Types.ObjectId(),
        profitLoss: -50.0,
        riskPercentUsed: 2.0,
        targetPercentAchieved: 0.0,
        exitedEarly: false,
        stopLossHit: true,
      }));

      await insertTrades([...winningTrades, ...losingTrades]);

      const result = await analysisService.getCurrentState(userId);

      expect(result.state).toBe('CONFIDENT');
      expect(result.confidence).toBeGreaterThan(50);
      expect(result.riskTolerance).toBeGreaterThan(50);
    });

    test('should identify frustrated state with low win rate', async () => {
      const userId = mongoose.Types.ObjectId();
      const winningTrades = Array.from({ length: 2 }, () => ({
        ...tradeOne,
        userId,
        _id: mongoose.Types.ObjectId(),
        profitLoss: 100.0,
        riskPercentUsed: 2.0,
        targetPercentAchieved: 100.0,
        exitedEarly: false,
        stopLossHit: false,
      }));

      const losingTrades = Array.from({ length: 8 }, () => ({
        ...tradeTwo,
        userId,
        _id: mongoose.Types.ObjectId(),
        profitLoss: -50.0,
        riskPercentUsed: 2.0,
        targetPercentAchieved: 0.0,
        exitedEarly: false,
        stopLossHit: true,
      }));

      await insertTrades([...winningTrades, ...losingTrades]);

      const result = await analysisService.getCurrentState(userId);

      expect(result.state).toBe('FRUSTRATED');
      expect(result.confidence).toBeLessThan(50);
      expect(result.riskTolerance).toBeLessThan(50);
    });

    test('should identify greedy state with high risk usage', async () => {
      const userId = mongoose.Types.ObjectId();
      const highRiskTrades = Array.from({ length: 5 }, () => ({
        ...tradeOne,
        userId,
        _id: mongoose.Types.ObjectId(),
        profitLoss: 200.0,
        riskPercentUsed: 5.0, // High risk
        targetPercentAchieved: 100.0,
        exitedEarly: false,
        stopLossHit: false,
      }));

      await insertTrades(highRiskTrades);

      const result = await analysisService.getCurrentState(userId);

      expect(result.state).toBe('GREEDY');
      expect(result.riskTolerance).toBeGreaterThan(50);
      expect(result.recommendations).toContain('Reduce risk per trade');
    });

    test('should identify fearful state with low risk usage', async () => {
      const userId = mongoose.Types.ObjectId();
      const lowRiskTrades = Array.from({ length: 5 }, () => ({
        ...tradeOne,
        userId,
        _id: mongoose.Types.ObjectId(),
        profitLoss: 50.0,
        riskPercentUsed: 0.5, // Low risk
        targetPercentAchieved: 100.0,
        exitedEarly: false,
        stopLossHit: false,
      }));

      await insertTrades(lowRiskTrades);

      const result = await analysisService.getCurrentState(userId);

      expect(result.state).toBe('FEARFUL');
      expect(result.riskTolerance).toBeLessThan(50);
      expect(result.recommendations).toContain('Consider increasing position size gradually');
    });
  });

  describe('getSessionForecast', () => {
    test('should return neutral forecast when no trades exist for session', async () => {
      const userId = mongoose.Types.ObjectId();

      const result = await analysisService.getSessionForecast(userId, 'LONDON');

      expect(result).toEqual({
        session: 'LONDON',
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
      });
    });

    test('should analyze session forecast from historical trades', async () => {
      const userId = mongoose.Types.ObjectId();
      const londonTrades = [
        {
          ...tradeOne,
          userId,
          session: 'LONDON',
          profitLoss: 150.0,
          riskPercentUsed: 2.0,
          targetPercentAchieved: 100.0,
        },
        {
          ...tradeTwo,
          userId,
          session: 'LONDON',
          profitLoss: 100.0,
          riskPercentUsed: 1.5,
          targetPercentAchieved: 80.0,
        },
      ];

      await insertTrades(londonTrades);

      const result = await analysisService.getSessionForecast(userId, 'LONDON');

      expect(result).toHaveProperty('session', 'LONDON');
      expect(result).toHaveProperty('forecast');
      expect(result).toHaveProperty('probability');
      expect(result).toHaveProperty('factors');
      expect(result).toHaveProperty('recommendations');
      expect(Array.isArray(result.factors)).toBe(true);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    test('should return positive forecast for profitable session', async () => {
      const userId = mongoose.Types.ObjectId();
      const profitableTrades = Array.from({ length: 8 }, () => ({
        ...tradeOne,
        userId,
        _id: mongoose.Types.ObjectId(),
        session: 'NY',
        profitLoss: 100.0,
        riskPercentUsed: 2.0,
        targetPercentAchieved: 100.0,
      }));

      const losingTrades = Array.from({ length: 2 }, () => ({
        ...tradeTwo,
        userId,
        _id: mongoose.Types.ObjectId(),
        session: 'NY',
        profitLoss: -50.0,
        riskPercentUsed: 2.0,
        targetPercentAchieved: 0.0,
      }));

      await insertTrades([...profitableTrades, ...losingTrades]);

      const result = await analysisService.getSessionForecast(userId, 'NY');

      expect(result.forecast).toBe('POSITIVE');
      expect(result.probability).toBeGreaterThan(50);
    });
  });

  describe('getPerformanceInsights', () => {
    test('should return performance insights for specified period', async () => {
      const userId = mongoose.Types.ObjectId();
      const trades = [
        {
          ...tradeOne,
          userId,
          entryTime: new Date('2023-01-01T09:00:00Z'),
          profitLoss: 150.0,
          riskPercentUsed: 2.0,
          targetPercentAchieved: 100.0,
        },
        {
          ...tradeTwo,
          userId,
          entryTime: new Date('2023-01-02T14:00:00Z'),
          profitLoss: -75.0,
          riskPercentUsed: 1.5,
          targetPercentAchieved: 0.0,
        },
      ];

      await insertTrades(trades);

      const result = await analysisService.getPerformanceInsights(userId, '7d');

      expect(result).toHaveProperty('period', '7d');
      expect(result).toHaveProperty('insights');
      expect(Array.isArray(result.insights)).toBe(true);
      expect(result.insights.length).toBeGreaterThan(0);
    });

    test('should return empty insights when no trades exist', async () => {
      const userId = mongoose.Types.ObjectId();

      const result = await analysisService.getPerformanceInsights(userId, '30d');

      expect(result).toEqual({
        period: '30d',
        insights: [],
        summary: 'No trading data available for analysis',
      });
    });
  });

  describe('getStateHistory', () => {
    test('should return state history with default filters', async () => {
      const userId = mongoose.Types.ObjectId();

      // Create some state analysis records
      const stateAnalysis = new StateAnalysis({
        userId,
        state: 'CONFIDENT',
        confidence: 75,
        riskTolerance: 70,
        emotionalBalance: 80,
        recommendations: ['Continue current approach'],
      });
      await stateAnalysis.save();

      const result = await analysisService.getStateHistory(userId, {});

      expect(result).toHaveProperty('history');
      expect(Array.isArray(result.history)).toBe(true);
      expect(result.history.length).toBeGreaterThan(0);
    });

    test('should apply date filters correctly', async () => {
      const userId = mongoose.Types.ObjectId();
      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-31');

      const result = await analysisService.getStateHistory(userId, {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      expect(result).toHaveProperty('history');
      expect(Array.isArray(result.history)).toBe(true);
    });

    test('should apply limit filter correctly', async () => {
      const userId = mongoose.Types.ObjectId();

      const result = await analysisService.getStateHistory(userId, { limit: 5 });

      expect(result).toHaveProperty('history');
      expect(Array.isArray(result.history)).toBe(true);
      expect(result.history.length).toBeLessThanOrEqual(5);
    });
  });
});
