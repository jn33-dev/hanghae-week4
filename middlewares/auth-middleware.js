const jwt = require("jsonwebtoken");
const { Users } = require("../models");
require("dotenv").config();
const env = process.env;
const {
  tokenObject,
  createToken,
  setCookieExpiration,
} = require("../util/jwtToken");
const throwCustomError = require("../error/errorFunction.js");

const validateToken = function (tokenType, tokenValue) {
  try {
    if (tokenType !== "Bearer") {
      throwCustomError("전달된 쿠키에서 오류가 발생하였습니다.", 403);
    }
    jwt.verify(tokenValue, env.JWT_KEY); // JWT를 검증합니다.
    return true;
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ errorMessage: err.message });
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
    const accessToken = req.cookies[env.ACCESSTOKEN_NAME];
    const refreshToken = req.cookies[env.REFRESHTOKEN_NAME];
    console.log("at", accessToken);
    console.log("rt", refreshToken);

    // 토큰이 만료 !== 토큰 없음, 둘 중 하나라도 없으면 로그인x -> 로그인 요청
    if (!accessToken || !refreshToken) {
      return throwCustomError("로그인 후 이용 가능합니다.", 401);
    }

    // 이 단계에서는 토큰이 모두 있음 but validation 필요
    const [accessTokenType, accessTokenValue] = accessToken.split(" ");
    const [refreshTokenType, refreshTokenValue] = refreshToken.split(" ");

    if (!validateToken(accessTokenType, accessTokenValue)) {
      if (!validateToken(refreshTokenType, refreshTokenValue))
        return throwCustomError(
          "Token이 모두 만료되었습니다. 로그인 후 이용 가능합니다.",
          419
        );

      const accessTokenId = tokenObject[refreshTokenValue];
      if (!accessTokenId)
        return throwCustomError(
          "Refresh Token의 정보가 서버에 존재하지 않습니다.",
          419
        );

      const newAccessToken = createToken(accessTokenId, "1h");
      res.cookie(env.ACCESSTOKEN_NAME, `Bearer ${newAccessToken}`, {
        expires: setCookieExpiration(1),
      });
      return res.json({ message: "AccessToken을 새롭게 발급하였습니다." });
    }

    try {
      const { userId } = getAccessTokenPayload(accessTokenValue);
      const user = await Users.findByPk(userId);

      res.locals.user = user;
      next();
    } catch (err) {
      console.log(err);
      if (err.status)
        return res.status(err.status).json({ errorMessage: err.message });
      res.status(401).send({ errorMessage: "로그인 후 이용 가능합니다." });
    }
  } catch (err) {
    console.log(err);
    if (err.status)
      return res.status(err.status).json({ errorMessage: err.message });
    return res
      .status(400)
      .send({ errorMessage: "알 수 없는 에러가 발생했습니다." });
  }
};
