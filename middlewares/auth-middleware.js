const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { Users } = require("../models");
require("dotenv").config();
const env = process.env;
const { tokenObject, createToken } = require("../routes/user");
const { createToken } = require("../util/jwtToken");
const throwCustomError = require("../error/customError.js");

const validateToken = function (token) {
  try {
    jwt.verify(token, env.JWT_KEY); // JWT를 검증합니다.
    return true;
  } catch (error) {
    return false;
  }
};
const getAccessTokenPayload = function (accessToken) {
  try {
    const payload = jwt.verify(accessToken, env.JWT_KEY); // JWT에서 Payload를 가져옵니다.
    return payload;
  } catch (error) {
    return null;
  }
};

module.exports = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken || !refreshToken) {
      return throwCustomError("로그인 후 이용 가능합니다.", 401);
    }

    const isAccessTokenValid = validateToken(accessToken);
    const isRefreshTokenValid = validateToken(refreshToken);

    if (!isRefreshTokenValid)
      return res
        .status(419)
        .json({ message: "Refresh Token이 만료되었습니다." });

    if (!isAccessTokenValid) {
      const accessTokenId = tokenObject[refreshToken];
      console.log("tokenObject", tokenObject);
      if (!accessTokenId)
        return res.status(419).json({
          message: "Refresh Token의 정보가 서버에 존재하지 않습니다.",
        });

      const newAccessToken = createToken(accessTokenId);
      res.cookie("accessToken", newAccessToken);
      return res.json({ message: "AccessToken을 새롭게 발급하였습니다." });
    }

    try {
      const { userId } = getAccessTokenPayload(accessToken);
      await Users.findOne({
        where: { userId },
        attributes: { exclude: ["password"] },
      }).then((user) => {
        res.locals.user = user;
        next();
      });
    } catch (err) {
      res.status(401).send({ errorMessage: "로그인 후 이용 가능합니다." });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ errorMessage: "알 수 없는 에러가 발생했습니다." });
  }
};
