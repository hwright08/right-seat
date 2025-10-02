const bcrypt = require('bcrypt');

const ROUNDS = 10;

exports.hashPassword = (pass) => {
  const peppered = pass + process.env.PW_PEPPER;
  return bcrypt.hash(peppered, ROUNDS);
}

exports.verifyPassword = (hash, pass) => {
  const peppered = pass + process.env.PW_PEPPER;
  return bcrypt.compare(peppered, hash);
}
