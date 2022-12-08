const jwt = require("jsonwebtoken");
require("dotenv").config();
const env = process.env;

let tokenObject = {};

function createToken(id, duration) {
  return jwt.sign({ userId: id }, env.JWT_KEY, {
    expiresIn: duration,
  });
}

const setCookieExpiration = function (hours) {
  const expires = new Date();
  expires.setHours(expires.getHours() + hours);
  return expires;
};

module.exports = { tokenObject, createToken, setCookieExpiration };
