const db = require('./db');

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
