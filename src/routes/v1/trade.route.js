const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const tradeValidation = require('../../validations/trade.validation');
const tradeController = require('../../controllers/trade.controller');

const router = express.Router();

router
  .route('/')
  .post(auth(), validate(tradeValidation.createTrade), tradeController.createTrade)
  .get(auth(), validate(tradeValidation.getTrades), tradeController.getTrades);

router.route('/bulk').post(auth(), validate(tradeValidation.createBulkTrades), tradeController.createBulkTrades);

router
  .route('/:tradeId')
  .get(auth(), validate(tradeValidation.getTrade), tradeController.getTrade)
  .put(auth(), validate(tradeValidation.updateTrade), tradeController.updateTrade)
  .delete(auth(), validate(tradeValidation.deleteTrade), tradeController.deleteTrade);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Trades
 *   description: Trade management
 */

/**
 * @swagger
 * /trades:
 *   post:
 *     summary: Create a trade
 *     description: Create a new trade for the authenticated user.
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - entryTime
 *               - exitTime
 *               - riskPercentUsed
 *               - profitLoss
 *               - riskRewardAchieved
 *               - session
 *               - stopLossHit
 *               - exitedEarly
 *               - targetPercentAchieved
 *             properties:
 *               entryTime:
 *                 type: string
 *                 format: date-time
 *                 description: Trade entry time
 *               exitTime:
 *                 type: string
 *                 format: date-time
 *                 description: Trade exit time
 *               riskPercentUsed:
 *                 type: number
 *                 minimum: 0
 *                 description: Risk percentage used for this trade
 *               profitLoss:
 *                 type: number
 *                 description: Profit or loss amount
 *               riskRewardAchieved:
 *                 type: number
 *                 minimum: 0
 *                 description: Risk-reward ratio achieved
 *               session:
 *                 type: string
 *                 enum: [LONDON, NY, ASIA]
 *                 description: Trading session
 *               stopLossHit:
 *                 type: boolean
 *                 description: Whether stop loss was hit
 *               exitedEarly:
 *                 type: boolean
 *                 description: Whether trade was exited early
 *               targetPercentAchieved:
 *                 type: number
 *                 minimum: 0
 *                 description: Target percentage achieved
 *               notes:
 *                 type: string
 *                 description: Additional notes
 *             example:
 *               entryTime: "2023-01-01T09:00:00Z"
 *               exitTime: "2023-01-01T10:30:00Z"
 *               riskPercentUsed: 2.0
 *               profitLoss: 150.0
 *               riskRewardAchieved: 1.5
 *               session: LONDON
 *               stopLossHit: false
 *               exitedEarly: false
 *               targetPercentAchieved: 100.0
 *               notes: "Good trade setup"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trade'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: Get all trades
 *     description: Get all trades for the authenticated user with pagination and filters.
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: session
 *         schema:
 *           type: string
 *           enum: [LONDON, NY, ASIA]
 *         description: Filter by trading session
 *       - in: query
 *         name: entryTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by entry time
 *       - in: query
 *         name: exitTime
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter by exit time
 *       - in: query
 *         name: stopLossHit
 *         schema:
 *           type: boolean
 *         description: Filter by stop loss hit
 *       - in: query
 *         name: exitedEarly
 *         schema:
 *           type: boolean
 *         description: Filter by early exit
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by field (e.g., entryTime:desc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of trades per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trade'
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 totalResults:
 *                   type: integer
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /trades/bulk:
 *   post:
 *     summary: Import multiple trades
 *     description: Import multiple trades for the authenticated user.
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trades
 *             properties:
 *               trades:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - entryTime
 *                     - exitTime
 *                     - riskPercentUsed
 *                     - profitLoss
 *                     - riskRewardAchieved
 *                     - session
 *                     - stopLossHit
 *                     - exitedEarly
 *                     - targetPercentAchieved
 *                   properties:
 *                     entryTime:
 *                       type: string
 *                       format: date-time
 *                     exitTime:
 *                       type: string
 *                       format: date-time
 *                     riskPercentUsed:
 *                       type: number
 *                       minimum: 0
 *                     profitLoss:
 *                       type: number
 *                     riskRewardAchieved:
 *                       type: number
 *                       minimum: 0
 *                     session:
 *                       type: string
 *                       enum: [LONDON, NY, ASIA]
 *                     stopLossHit:
 *                       type: boolean
 *                     exitedEarly:
 *                       type: boolean
 *                     targetPercentAchieved:
 *                       type: number
 *                       minimum: 0
 *                     notes:
 *                       type: string
 *             example:
 *               trades:
 *                 - entryTime: "2023-01-01T09:00:00Z"
 *                   exitTime: "2023-01-01T10:30:00Z"
 *                   riskPercentUsed: 2.0
 *                   profitLoss: 150.0
 *                   riskRewardAchieved: 1.5
 *                   session: LONDON
 *                   stopLossHit: false
 *                   exitedEarly: false
 *                   targetPercentAchieved: 100.0
 *                   notes: "Good trade"
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 trades:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trade'
 *                 count:
 *                   type: integer
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /trades/{id}:
 *   get:
 *     summary: Get a trade
 *     description: Get a specific trade by ID for the authenticated user.
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trade ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trade'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   put:
 *     summary: Update a trade
 *     description: Update a specific trade by ID for the authenticated user.
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trade ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               entryTime:
 *                 type: string
 *                 format: date-time
 *               exitTime:
 *                 type: string
 *                 format: date-time
 *               riskPercentUsed:
 *                 type: number
 *                 minimum: 0
 *               profitLoss:
 *                 type: number
 *               riskRewardAchieved:
 *                 type: number
 *                 minimum: 0
 *               session:
 *                 type: string
 *                 enum: [LONDON, NY, ASIA]
 *               stopLossHit:
 *                 type: boolean
 *               exitedEarly:
 *                 type: boolean
 *               targetPercentAchieved:
 *                 type: number
 *                 minimum: 0
 *               notes:
 *                 type: string
 *             example:
 *               profitLoss: 200.0
 *               notes: "Updated notes"
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trade'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a trade
 *     description: Delete a specific trade by ID for the authenticated user.
 *     tags: [Trades]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Trade ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
