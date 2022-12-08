const jwt = require("jsonwebtoken");
require("dotenv").config();
const env = process.env;

function createToken(id) {
  return jwt.sign({ userId: id }, env.JWT_KEY, {
    expiresIn: "100s",
  });
}

let tokenObject = {};

module.exports = { createAccessToken, tokenObject };
