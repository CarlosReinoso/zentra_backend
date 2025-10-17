const httpStatus = require('http-status');
const { Trade } = require('../models');
const ApiError = require('../utils/ApiError');
const logger = require('../config/logger');

/**
 * Create a trade
 * @param {ObjectId} userId
 * @param {Object} tradeBody
 * @returns {Promise<Trade>}
 */
const createTrade = async (userId, tradeBody) => {
  logger.info('Service: Creating trade for user:', userId);
  logger.info('Service: Trade data:', tradeBody);

  const trade = new Trade({
    userId,
    ...tradeBody,
  });
  await trade.save();
  return trade;
};

/**
 * Create multiple trades
 * @param {ObjectId} userId
 * @param {Array} tradesData
 * @returns {Promise<Array<Trade>>}
 */
const createBulkTrades = async (userId, tradesData) => {
  logger.info('Service: Creating bulk trades for user:', userId);
  logger.info('Service: Number of trades:', tradesData.length);

  const trades = tradesData.map((tradeData) => ({
    userId,
    ...tradeData,
  }));

  const result = await Trade.insertMany(trades);
  logger.info('Service: Bulk trades created successfully:', result.length);
  return result;
};

/**
 * Query for trades
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTrades = async (filter, options) => {
  logger.info('Service: Querying trades with filter:', filter);
  logger.info('Service: Query options:', options);

  const trades = await Trade.paginate(filter, options);
  logger.info('Service: Trades found:', trades.results.length);
  return trades;
};

/**
 * Get trade by id
 * @param {ObjectId} tradeId
 * @param {ObjectId} userId
 * @returns {Promise<Trade>}
 */
const getTradeById = async (tradeId, userId) => {
  logger.info('Service: Getting trade by id:', tradeId, 'for user:', userId);
  const trade = await Trade.findOne({ _id: tradeId, userId });
  logger.info('Service: Trade found:', !!trade);
  return trade;
};

/**
 * Update trade by id
 * @param {ObjectId} tradeId
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<Trade>}
 */
const updateTradeById = async (tradeId, userId, updateBody) => {
  logger.info('Service: Updating trade:', tradeId, 'for user:', userId);
  logger.info('Service: Update data:', updateBody);

  const trade = await getTradeById(tradeId, userId);
  if (!trade) {
    logger.info('Service: Trade not found for update:', tradeId);
    throw new ApiError(httpStatus.NOT_FOUND, 'Trade not found');
  }

  Object.assign(trade, updateBody);
  await trade.save();
  logger.info('Service: Trade updated successfully:', trade.id);
  return trade;
};

/**
 * Delete trade by id
 * @param {ObjectId} tradeId
 * @param {ObjectId} userId
 * @returns {Promise<void>}
 */
const deleteTradeById = async (tradeId, userId) => {
  logger.info('Service: Deleting trade:', tradeId, 'for user:', userId);

  const trade = await getTradeById(tradeId, userId);
  if (!trade) {
    logger.info('Service: Trade not found for deletion:', tradeId);
    throw new ApiError(httpStatus.NOT_FOUND, 'Trade not found');
  }

  logger.info('Service: Deleting trade:', trade.id);
  await trade.remove();
};

module.exports = {
  createTrade,
  createBulkTrades,
  queryTrades,
  getTradeById,
  updateTradeById,
  deleteTradeById,
};
