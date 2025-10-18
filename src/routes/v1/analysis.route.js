const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const analysisValidation = require('../../validations/analysis.validation');
const analysisController = require('../../controllers/analysis.controller');

const router = express.Router();

router.route('/state').get(auth(), validate(analysisValidation.getState), analysisController.getState);

router.route('/forecast').get(auth(), validate(analysisValidation.getForecast), analysisController.getForecast);

router.route('/insights').get(auth(), validate(analysisValidation.getInsights), analysisController.getInsights);

router.route('/history').get(auth(), validate(analysisValidation.getHistory), analysisController.getHistory);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Analysis
 *   description: Trading psychological analysis
 */

/**
 * @swagger
 * /analysis/state:
 *   get:
 *     summary: Get current psychological state
 *     description: Get the current psychological state analysis for the authenticated user.
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 state:
 *                   type: string
 *                   enum: [CONFIDENT, ANXIOUS, FRUSTRATED, DISCIPLINED, GREEDY, FEARFUL]
 *                   description: Current psychological state
 *                 confidence:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 100
 *                   description: Confidence level percentage
 *                 riskTolerance:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 100
 *                   description: Risk tolerance level
 *                 emotionalBalance:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 100
 *                   description: Emotional balance score
 *                 lastUpdated:
 *                   type: string
 *                   format: date-time
 *                   description: Last state update timestamp
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Psychological recommendations
 *             example:
 *               state: "CONFIDENT"
 *               confidence: 75
 *               riskTolerance: 60
 *               emotionalBalance: 80
 *               lastUpdated: "2023-01-01T09:00:00Z"
 *               recommendations: ["Consider taking a break", "Review risk management"]
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /analysis/forecast:
 *   get:
 *     summary: Get session forecast
 *     description: Get psychological forecast for the current trading session.
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: session
 *         schema:
 *           type: string
 *           enum: [LONDON, NY, ASIA]
 *         description: Trading session to forecast
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 session:
 *                   type: string
 *                   enum: [LONDON, NY, ASIA]
 *                   description: Trading session
 *                 forecast:
 *                   type: string
 *                   enum: [POSITIVE, NEUTRAL, NEGATIVE]
 *                   description: Psychological forecast
 *                 probability:
 *                   type: number
 *                   minimum: 0
 *                   maximum: 100
 *                   description: Forecast probability percentage
 *                 factors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       factor:
 *                         type: string
 *                         description: Factor name
 *                       impact:
 *                         type: string
 *                         enum: [POSITIVE, NEGATIVE, NEUTRAL]
 *                         description: Factor impact
 *                       weight:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 1
 *                         description: Factor weight
 *                   description: Contributing factors
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Session recommendations
 *             example:
 *               session: "LONDON"
 *               forecast: "POSITIVE"
 *               probability: 78
 *               factors:
 *                 - factor: "Recent wins"
 *                   impact: "POSITIVE"
 *                   weight: 0.6
 *                 - factor: "Market volatility"
 *                   impact: "NEGATIVE"
 *                   weight: 0.4
 *               recommendations: ["Start with smaller positions", "Set strict stop losses"]
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /analysis/insights:
 *   get:
 *     summary: Get performance insights
 *     description: Get psychological insights based on trading performance.
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [WEEK, MONTH, QUARTER, YEAR]
 *         default: MONTH
 *         description: Analysis period
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
 *                 insights:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         enum: [STRENGTH, WEAKNESS, OPPORTUNITY, THREAT]
 *                         description: Insight type
 *                       description:
 *                         type: string
 *                         description: Insight description
 *                       confidence:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 100
 *                         description: Confidence level
 *                       impact:
 *                         type: string
 *                         enum: [HIGH, MEDIUM, LOW]
 *                         description: Impact level
 *                   description: Performance insights
 *                 patterns:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       pattern:
 *                         type: string
 *                         description: Pattern name
 *                       frequency:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 100
 *                         description: Pattern frequency percentage
 *                       correlation:
 *                         type: number
 *                         minimum: -1
 *                         maximum: 1
 *                         description: Correlation with performance
 *                   description: Behavioral patterns
 *                 recommendations:
 *                   type: array
 *                   items:
 *                     type: string
 *                   description: Improvement recommendations
 *             example:
 *               period: "MONTH"
 *               insights:
 *                 - type: "STRENGTH"
 *                   description: "Consistent risk management in winning trades"
 *                   confidence: 85
 *                   impact: "HIGH"
 *                 - type: "WEAKNESS"
 *                   description: "Tendency to hold losing positions too long"
 *                   confidence: 72
 *                   impact: "MEDIUM"
 *               patterns:
 *                 - pattern: "Early exit on profitable trades"
 *                   frequency: 65
 *                   correlation: -0.3
 *               recommendations: ["Practice holding winners longer", "Review exit strategies"]
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /analysis/history:
 *   get:
 *     summary: Get historical state changes
 *     description: Get historical psychological state changes over time.
 *     tags: [Analysis]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for history
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for history
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         default: 50
 *         description: Maximum number of records
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 history:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: State change timestamp
 *                       state:
 *                         type: string
 *                         enum: [CONFIDENT, ANXIOUS, FRUSTRATED, DISCIPLINED, GREEDY, FEARFUL]
 *                         description: Psychological state
 *                       confidence:
 *                         type: number
 *                         minimum: 0
 *                         maximum: 100
 *                         description: Confidence level
 *                       trigger:
 *                         type: string
 *                         description: State change trigger
 *                       context:
 *                         type: object
 *                         description: Additional context
 *                   description: Historical state changes
 *                 summary:
 *                   type: object
 *                   properties:
 *                     totalChanges:
 *                       type: integer
 *                       description: Total number of state changes
 *                     mostCommonState:
 *                       type: string
 *                       description: Most common state
 *                     averageConfidence:
 *                       type: number
 *                       description: Average confidence level
 *                     volatility:
 *                       type: number
 *                       description: State volatility score
 *                   description: History summary
 *             example:
 *               history:
 *                 - timestamp: "2023-01-01T09:00:00Z"
 *                   state: "CONFIDENT"
 *                   confidence: 75
 *                   trigger: "Successful trade"
 *                   context: {"tradeId": "123", "profit": 150}
 *                 - timestamp: "2023-01-01T10:30:00Z"
 *                   state: "ANXIOUS"
 *                   confidence: 45
 *                   trigger: "Stop loss hit"
 *                   context: {"tradeId": "124", "loss": -75}
 *               summary:
 *                 totalChanges: 25
 *                 mostCommonState: "CONFIDENT"
 *                 averageConfidence: 68
 *                 volatility: 0.3
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */
