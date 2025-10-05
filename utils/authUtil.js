const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const ROUNDS = 10;

exports.hashPassword = (pass) => {
  const peppered = pass + process.env.PW_PEPPER;
  return bcrypt.hash(peppered, ROUNDS);
}

exports.verifyPassword = (hash, pass) => {
  const peppered = pass + process.env.PW_PEPPER;
  return bcrypt.compare(peppered, hash);
}

exports.generateAccessJWT = (userId) => {
  return jwt.sign(
    { userId },
    process.env.SECRET_ACCESS_TOKEN,
    { expiresIn: '60m'},
  );
}
