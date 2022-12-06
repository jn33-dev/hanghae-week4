const jwt = require("jsonwebtoken");
const { Users } = require("../models");
require("dotenv").config();
const env = process.env;
const {
  tokenObject,
  createAccessToken,
  createRefreshToken,
} = require("../routes/usersAndAuth");

// 일단 구현해보고, refresh token으로 확인되면 access token 발급하는 방식 추가
// module.exports = async (req, res, next) => {
//   const { authorization } = req.headers;
//   const [authType, authToken] = (authorization || "").split(" ");

//   if (!authToken || authType !== "Bearer") {
//     res.status(401).send({ errorMessage: "로그인 후 이용 가능합니다." });
//     return;
//   }

//   try {
//     const { userId } = jwt.verify(authToken, env.JWT_KEY);
//     await Users.findOne({
//       where: { userId },
//       attributes: { exclude: ["password"] },
//     }).then((user) => {
//       res.locals.user = user;
//       next();
//     });
//   } catch (err) {
//     res.status(401).send({ errorMessage: "로그인 후 이용 가능합니다." });
//   }
// };

// accessToken과 refreshToken을 검증하고, accessToken 만료면, refreshToken으로 accessToken 새로 발급 후 accessToken의 payload에서 userId 받아 오기
module.exports = async (req, res, next) => {
  try {
    const { accessToken, refreshToken } = req.cookies;

    if (!accessToken || !refreshToken) {
      res.status(401).send({ errorMessage: "로그인 후 이용 가능합니다." });
      return;
    }

    const isAccessTokenValid = validateAccessToken(accessToken);
    const isRefreshTokenValid = validateRefreshToken(refreshToken);

    if (!isRefreshTokenValid)
      return res
        .status(419)
        .json({ message: "Refresh Token이 만료되었습니다." });

    if (!isAccessTokenValid) {
      const accessTokenId = tokenObject[refreshToken];
      if (!accessTokenId)
        return res.status(419).json({
          message: "Refresh Token의 정보가 서버에 존재하지 않습니다.",
        });

      const newAccessToken = createAccessToken(accessTokenId);
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

// Access Token을 검증합니다.
function validateAccessToken(accessToken) {
  try {
    jwt.verify(accessToken, env.JWT_KEY); // JWT를 검증합니다.
    return true;
  } catch (error) {
    return false;
  }
}

// Refresh Token을 검증합니다.
function validateRefreshToken(refreshToken) {
  try {
    jwt.verify(refreshToken, env.JWT_KEY); // JWT를 검증합니다.
    return true;
  } catch (error) {
    return false;
  }
}

// Access Token의 Payload를 가져옵니다.
function getAccessTokenPayload(accessToken) {
  try {
    const payload = jwt.verify(accessToken, env.JWT_KEY); // JWT에서 Payload를 가져옵니다.
    return payload;
  } catch (error) {
    return null;
  }
}
