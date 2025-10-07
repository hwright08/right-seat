/** @module utils/auth */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ROUNDS = 10;


/**
 * Hashes a string for use as passwords
 * @param {string} pass - The password to hash
 * @returns {Promise<string>}
 */
exports.hashPassword = async (pass) => {
  const peppered = pass + process.env.PW_PEPPER;
  return await bcrypt.hash(peppered, ROUNDS);
}

/**
 * Determines if the hash matches the passed in password
 * @param {string} hash - The hashed value
 * @param {string} pass - The human-readable value for a password
 * @returns {Promise<boolean>}
 */
exports.verifyPassword = async (hash, pass) => {
  const peppered = pass + process.env.PW_PEPPER;
  return await bcrypt.compare(peppered, hash);
}


/**
 * Create a JSON Web Token to create a session cookie for a specific user
 * @param {number} userId - The user ID that we want to create a JWT for
 * @returns {JWT}
 */
exports.generateAccessJWT = (userId) => {
  return jwt.sign(
    { userId },
    process.env.SECRET_ACCESS_TOKEN,
    { expiresIn: '24h'},
  );
}
