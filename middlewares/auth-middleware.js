const jwt = require("jsonwebtoken");
const { Users } = require("../models");
require("dotenv").config();
const env = process.env;

// 일단 구현해보고, refresh token으로 확인되면 access token 발급하는 방식 추가
module.exports = async (req, res, next) => {
  const { authorization } = req.headers;
  const [authType, authToken] = (authorization || "").split(" ");

  if (!authToken || authType !== "Bearer") {
    res.status(401).send({ errorMessage: "로그인 후 이용 가능합니다." });
    return;
  }

  try {
    const { userId } = jwt.verify(authToken, env.JWT_KEY);
    await Users.findOne({ where: { userId } }).then((user) => {
      res.locals.user = { userId: user.userId, nickname: user.nickname };
      next();
    });
  } catch (err) {
    res.status(401).send({ errorMessage: "로그인 후 이용 가능합니다." });
  }
};
