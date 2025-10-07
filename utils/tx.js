/** @module utils/tx */

const db = require('./db');

/**
 * Wrapper for multiple sequelize read/write queries that need to be in the same transaction
 * @param {function} cb - A callback function containing the SQL/Sequelize queries that will need a transaction
 */
module.exports = async (cb) => {
  const transaction = await db.transaction();

  try {
    await cb(transaction);
    await transaction.commit();
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}
