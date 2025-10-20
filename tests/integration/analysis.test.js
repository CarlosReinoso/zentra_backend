const request = require('supertest');
const httpStatus = require('http-status');
const app = require('../../src/app');
const setupTestDB = require('../utils/setupTestDB');
const { userOne, insertUsers } = require('../fixtures/user.fixture');
const { userOneAccessToken } = require('../fixtures/token.fixture');
const { tradeOne, tradeTwo, insertTrades } = require('../fixtures/trade.fixture');

setupTestDB();

describe('Analysis routes', () => {
  describe('GET /v1/analysis/state', () => {
    test('should return 200 and current psychological state', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/analysis/state')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('state');
      expect(res.body).toHaveProperty('confidence');
      expect(res.body).toHaveProperty('riskTolerance');
      expect(res.body).toHaveProperty('emotionalBalance');
      expect(res.body).toHaveProperty('lastUpdated');
      expect(res.body).toHaveProperty('recommendations');
      expect(Array.isArray(res.body.recommendations)).toBe(true);
      expect(typeof res.body.confidence).toBe('number');
      expect(typeof res.body.riskTolerance).toBe('number');
      expect(typeof res.body.emotionalBalance).toBe('number');
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/analysis/state').expect(httpStatus.UNAUTHORIZED);
    });

    test('should return neutral state when no trades exist', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/analysis/state')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.state).toBe('NEUTRAL');
      expect(res.body.confidence).toBe(50);
      expect(res.body.riskTolerance).toBe(50);
      expect(res.body.emotionalBalance).toBe(50);
      expect(res.body.recommendations).toContain('Start trading to build psychological profile');
    });

    test('should analyze state from recent trades', async () => {
      await insertUsers([userOne]);

      // Insert some trades for analysis
      const trades = [
        {
          ...tradeOne,
          userId: userOne._id,
          profitLoss: 150.0,
          riskPercentUsed: 2.0,
          targetPercentAchieved: 100.0,
          exitedEarly: false,
          stopLossHit: false,
        },
        {
          ...tradeTwo,
          userId: userOne._id,
          profitLoss: -75.0,
          riskPercentUsed: 1.5,
          targetPercentAchieved: 0.0,
          exitedEarly: false,
          stopLossHit: true,
        },
      ];

      await insertTrades(trades);

      const res = await request(app)
        .get('/v1/analysis/state')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('state');
      expect(res.body).toHaveProperty('confidence');
      expect(res.body).toHaveProperty('riskTolerance');
      expect(res.body).toHaveProperty('emotionalBalance');
      expect(res.body).toHaveProperty('recommendations');
      expect(Array.isArray(res.body.recommendations)).toBe(true);
    });
  });

  describe('GET /v1/analysis/forecast', () => {
    test('should return 200 and session forecast', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/analysis/forecast')
        .query({ session: 'LONDON' })
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('session', 'LONDON');
      expect(res.body).toHaveProperty('forecast');
      expect(res.body).toHaveProperty('probability');
      expect(res.body).toHaveProperty('factors');
      expect(res.body).toHaveProperty('recommendations');
      expect(Array.isArray(res.body.factors)).toBe(true);
      expect(Array.isArray(res.body.recommendations)).toBe(true);
      expect(typeof res.body.probability).toBe('number');
    });

    test('should return 400 if session parameter is missing', async () => {
      await insertUsers([userOne]);

      await request(app)
        .get('/v1/analysis/forecast')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/analysis/forecast').query({ session: 'LONDON' }).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return neutral forecast when no trades exist for session', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/analysis/forecast')
        .query({ session: 'LONDON' })
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.session).toBe('LONDON');
      expect(res.body.forecast).toBe('NEUTRAL');
      expect(res.body.probability).toBe(50);
      expect(res.body.factors).toHaveLength(1);
      expect(res.body.factors[0].factor).toBe('No historical data');
      expect(res.body.recommendations).toContain('Start trading this session to build forecast data');
    });

    test('should analyze forecast from session-specific trades', async () => {
      await insertUsers([userOne]);

      // Insert trades for LONDON session
      const londonTrades = [
        {
          ...tradeOne,
          userId: userOne._id,
          session: 'LONDON',
          profitLoss: 150.0,
          riskPercentUsed: 2.0,
          targetPercentAchieved: 100.0,
        },
        {
          ...tradeTwo,
          userId: userOne._id,
          session: 'LONDON',
          profitLoss: 100.0,
          riskPercentUsed: 1.5,
          targetPercentAchieved: 80.0,
        },
      ];

      await insertTrades(londonTrades);

      const res = await request(app)
        .get('/v1/analysis/forecast')
        .query({ session: 'LONDON' })
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.session).toBe('LONDON');
      expect(res.body).toHaveProperty('forecast');
      expect(res.body).toHaveProperty('probability');
      expect(res.body).toHaveProperty('factors');
      expect(res.body).toHaveProperty('recommendations');
    });
  });

  describe('GET /v1/analysis/insights', () => {
    test('should return 200 and performance insights', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/analysis/insights')
        .query({ period: '7d' })
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('period', '7d');
      expect(res.body).toHaveProperty('insights');
      expect(Array.isArray(res.body.insights)).toBe(true);
    });

    test('should return 400 if period parameter is missing', async () => {
      await insertUsers([userOne]);

      await request(app)
        .get('/v1/analysis/insights')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.BAD_REQUEST);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/analysis/insights').query({ period: '7d' }).expect(httpStatus.UNAUTHORIZED);
    });

    test('should return empty insights when no trades exist', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/analysis/insights')
        .query({ period: '30d' })
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.period).toBe('30d');
      expect(res.body.insights).toEqual([]);
      expect(res.body.summary).toBe('No trading data available for analysis');
    });

    test('should analyze insights from trades in specified period', async () => {
      await insertUsers([userOne]);

      // Insert trades for analysis
      const trades = [
        {
          ...tradeOne,
          userId: userOne._id,
          entryTime: new Date('2023-01-01T09:00:00Z'),
          profitLoss: 150.0,
          riskPercentUsed: 2.0,
          targetPercentAchieved: 100.0,
        },
        {
          ...tradeTwo,
          userId: userOne._id,
          entryTime: new Date('2023-01-02T14:00:00Z'),
          profitLoss: -75.0,
          riskPercentUsed: 1.5,
          targetPercentAchieved: 0.0,
        },
      ];

      await insertTrades(trades);

      const res = await request(app)
        .get('/v1/analysis/insights')
        .query({ period: '7d' })
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body.period).toBe('7d');
      expect(res.body).toHaveProperty('insights');
      expect(Array.isArray(res.body.insights)).toBe(true);
    });
  });

  describe('GET /v1/analysis/history', () => {
    test('should return 200 and state history', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/analysis/history')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('history');
      expect(Array.isArray(res.body.history)).toBe(true);
    });

    test('should return 401 if access token is missing', async () => {
      await request(app).get('/v1/analysis/history').expect(httpStatus.UNAUTHORIZED);
    });

    test('should apply date filters correctly', async () => {
      await insertUsers([userOne]);

      const startDate = new Date('2023-01-01').toISOString();
      const endDate = new Date('2023-01-31').toISOString();

      const res = await request(app)
        .get('/v1/analysis/history')
        .query({ startDate, endDate })
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('history');
      expect(Array.isArray(res.body.history)).toBe(true);
    });

    test('should apply limit filter correctly', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/analysis/history')
        .query({ limit: 5 })
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('history');
      expect(Array.isArray(res.body.history)).toBe(true);
      expect(res.body.history.length).toBeLessThanOrEqual(5);
    });

    test('should return empty history when no state analysis exists', async () => {
      await insertUsers([userOne]);

      const res = await request(app)
        .get('/v1/analysis/history')
        .set('Authorization', `Bearer ${userOneAccessToken}`)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('history');
      expect(Array.isArray(res.body.history)).toBe(true);
    });
  });
});
