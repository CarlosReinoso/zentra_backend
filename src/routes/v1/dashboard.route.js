const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const dashboardValidation = require('../../validations/dashboard.validation');
const dashboardController = require('../../controllers/dashboard.controller');

const router = express.Router();

router.route('/').get(auth(), validate(dashboardValidation.getDashboard), dashboardController.getDashboard);

router.route('/summary').get(auth(), validate(dashboardValidation.getSummary), dashboardController.getSummary);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Trading dashboard and analytics
 */

/**
 * @swagger
 * /dashboard:
 *   get:
 *     summary: Get complete dashboard data
 *     description: Get comprehensive dashboard data including trades, performance metrics, psychological state, and insights.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [WEEK, MONTH, QUARTER, YEAR]
 *         default: MONTH
 *         description: Analysis period for dashboard data
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                   enum: [WEEK, MONTH, QUARTER, YEAR]
 *                   description: Analysis period
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalTrades:
 *                       type: integer
 *                       description: Total number of trades
 *                     winningTrades:
 *                       type: integer
 *                       description: Number of winning trades
 *                     losingTrades:
 *                       type: integer
 *                       description: Number of losing trades
 *                     winRate:
 *                       type: number
 *                       description: Win rate percentage
 *                     totalProfitLoss:
 *                       type: number
 *                       description: Total profit/loss
 *                     averageRiskReward:
 *                       type: number
 *                       description: Average risk-reward ratio
 *                     bestTrade:
 *                       type: number
 *                       description: Best trade profit
 *                     worstTrade:
 *                       type: number
 *                       description: Worst trade loss
 *                 psychologicalState:
 *                   type: object
 *                   properties:
 *                     state:
 *                       type: string
 *                       enum: [CONFIDENT, ANXIOUS, FRUSTRATED, DISCIPLINED, GREEDY, FEARFUL]
 *                       description: Current psychological state
 *                     confidence:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                       description: Confidence level
 *                     riskTolerance:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                       description: Risk tolerance level
 *                     emotionalBalance:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                       description: Emotional balance score
 *                 performance:
 *                   type: object
 *                   properties:
 *                     dailyPnL:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           profitLoss:
 *                             type: number
 *                     sessionPerformance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           session:
 *                             type: string
 *                             enum: [LONDON, NY, ASIA]
 *                           trades:
 *                             type: integer
 *                           profitLoss:
 *                             type: number
 *                           winRate:
 *                             type: number
 *                     riskMetrics:
 *                       type: object
 *                       properties:
 *                         averageRiskPerTrade:
 *                           type: number
 *                         maxDrawdown:
 *                           type: number
 *                         sharpeRatio:
 *                           type: number
 *                 insights:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [STRENGTH, WEAKNESS, OPPORTUNITY, THREAT]
 *                       description:
 *                         type: string
 *                       confidence:
 *                         type: number
 *                       impact:
 *                         type: string
 *                         enum: [HIGH, MEDIUM, LOW]
 *                 recentTrades:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       entryTime:
 *                         type: string
 *                         format: date-time
 *                       exitTime:
 *                         type: string
 *                         format: date-time
 *                       profitLoss:
 *                         type: number
 *                       session:
 *                         type: string
 *                         enum: [LONDON, NY, ASIA]
 *                       riskPercentUsed:
 *                         type: number
 *                       riskRewardAchieved:
 *                         type: number
 *             example:
 *               period: "MONTH"
 *               summary:
 *                 totalTrades: 25
 *                 winningTrades: 15
 *                 losingTrades: 10
 *                 winRate: 60.0
 *                 totalProfitLoss: 1250.0
 *                 averageRiskReward: 1.8
 *                 bestTrade: 450.0
 *                 worstTrade: -180.0
 *               psychologicalState:
 *                 state: "CONFIDENT"
 *                 confidence: 75
 *                 riskTolerance: 60
 *                 emotionalBalance: 80
 *               performance:
 *                 dailyPnL:
 *                   - date: "2023-01-01"
 *                     profitLoss: 150.0
 *                   - date: "2023-01-02"
 *                     profitLoss: -75.0
 *                 sessionPerformance:
 *                   - session: "LONDON"
 *                     trades: 12
 *                     profitLoss: 800.0
 *                     winRate: 66.7
 *                   - session: "NY"
 *                     trades: 8
 *                     profitLoss: 300.0
 *                     winRate: 62.5
 *                 riskMetrics:
 *                   averageRiskPerTrade: 2.1
 *                   maxDrawdown: 5.2
 *                   sharpeRatio: 1.4
 *               insights:
 *                 - type: "STRENGTH"
 *                   description: "Consistent risk management"
 *                   confidence: 85
 *                   impact: "HIGH"
 *                 - type: "OPPORTUNITY"
 *                   description: "Strong performance in London session"
 *                   confidence: 70
 *                   impact: "MEDIUM"
 *               recentTrades:
 *                 - id: "trade123"
 *                   entryTime: "2023-01-01T09:00:00Z"
 *                   exitTime: "2023-01-01T10:30:00Z"
 *                   profitLoss: 150.0
 *                   session: "LONDON"
 *                   riskPercentUsed: 2.0
 *                   riskRewardAchieved: 1.5
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /dashboard/summary:
 *   get:
 *     summary: Get summary stats
 *     description: Get quick summary statistics for the dashboard header or overview.
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [WEEK, MONTH, QUARTER, YEAR]
 *         default: MONTH
 *         description: Analysis period for summary stats
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 period:
 *                   type: string
 *                   enum: [WEEK, MONTH, QUARTER, YEAR]
 *                   description: Analysis period
 *                 quickStats:
 *                   type: object
 *                   properties:
 *                     totalTrades:
 *                       type: integer
 *                       description: Total number of trades
 *                     winRate:
 *                       type: number
 *                       description: Win rate percentage
 *                     totalPnL:
 *                       type: number
 *                       description: Total profit/loss
 *                     avgRiskReward:
 *                       type: number
 *                       description: Average risk-reward ratio
 *                     currentState:
 *                       type: string
 *                       enum: [CONFIDENT, ANXIOUS, FRUSTRATED, DISCIPLINED, GREEDY, FEARFUL]
 *                       description: Current psychological state
 *                     confidence:
 *                       type: number
 *                       minimum: 0
 *                       maximum: 100
 *                       description: Confidence level
 *                 trends:
 *                   type: object
 *                   properties:
 *                     pnlTrend:
 *                       type: string
 *                       enum: [UP, DOWN, STABLE]
 *                       description: P&L trend direction
 *                     winRateTrend:
 *                       type: string
 *                       enum: [UP, DOWN, STABLE]
 *                       description: Win rate trend direction
 *                     riskTrend:
 *                       type: string
 *                       enum: [UP, DOWN, STABLE]
 *                       description: Risk management trend
 *                 alerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [WARNING, SUCCESS, INFO, ERROR]
 *                       message:
 *                         type: string
 *                       priority:
 *                         type: string
 *                         enum: [HIGH, MEDIUM, LOW]
 *             example:
 *               period: "MONTH"
 *               quickStats:
 *                 totalTrades: 25
 *                 winRate: 60.0
 *                 totalPnL: 1250.0
 *                 avgRiskReward: 1.8
 *                 currentState: "CONFIDENT"
 *                 confidence: 75
 *               trends:
 *                 pnlTrend: "UP"
 *                 winRateTrend: "STABLE"
 *                 riskTrend: "DOWN"
 *               alerts:
 *                 - type: "SUCCESS"
 *                   message: "Win rate improved this week"
 *                   priority: "MEDIUM"
 *                 - type: "WARNING"
 *                   message: "Risk per trade above target"
 *                   priority: "HIGH"
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
