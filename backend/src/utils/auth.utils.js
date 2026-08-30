const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/constants');

const hashPassword = async (password) => bcrypt.hash(password, 10);

const comparePassword = async (password, hash) => bcrypt.compare(password, hash);

const generateToken = (payload) =>
  jwt.sign(payload, config.jwtSecret, { expiresIn: config.jwtExpiresIn });

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
};
