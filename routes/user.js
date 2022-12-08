const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const {
  isPasswordIncludesNickname,
  postUserSchema,
  postAuthSchema,
} = require("../middlewares/validation-middleware");
const {
  tokenObject,
  createToken,
  setCookieExpiration,
} = require("../util/jwtToken");
const authLoginUserMiddleware = require("../middlewares/authLoginUser-middleware");
const throwCustomError = require("../error/errorFunction");
require("dotenv").config();
const env = process.env;

//######## 회원가입 ############
router.post("/signup", authLoginUserMiddleware, async (req, res) => {
  try {
    const { nickname, password } = await postUserSchema.validateAsync(req.body);
    isPasswordIncludesNickname(password, nickname);
    const existsUsers = await Users.findOne({ where: { nickname } });
    if (existsUsers) {
      return throwCustomError("중복된 닉네임입니다.", 412);
    }
    await Users.create({ nickname, password });

    res.status(201).send({ message: "회원 가입에 성공하였습니다." });
  } catch (err) {
    console.log(err);
    if (err.status) {
      return res.status(err.status).send({ errorMessage: err.message });
    } else
      return res
        .status(400)
        .send({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
  }
});

//######## 로그인 ############
router.post("/login", authLoginUserMiddleware, async (req, res) => {
  try {
    const { nickname, password } = await postAuthSchema.validateAsync(req.body);
    const user = await Users.findOne({ where: { nickname } });

    if (!user || password !== user.password) {
      return throwCustomError("닉네임 또는 패스워드를 확인해주세요.", 412);
    }

    const accessToken = createToken(user.userId, "1h");
    const refreshToken = createToken("refreshToken", "1d");

    tokenObject[refreshToken] = user.userId;
    res.cookie(env.ACCESSTOKEN_NAME, `Bearer ${accessToken}`, {
      expires: setCookieExpiration(1),
    });
    res.cookie(env.REFRESHTOKEN_NAME, `Bearer ${refreshToken}`, {
      expires: setCookieExpiration(24),
    });

    return res
      .status(200)
      .send({ message: "Token이 정상적으로 발급되었습니다." });
  } catch (err) {
    console.log(err);
    if (err.status) {
      return res.status(err.status).send({ errorMessage: err.message });
    } else
      return res
        .status(400)
        .send({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
  }
});

router.get("/logout", (req, res, next) => {
  try {
    if (
      !req.cookies[env.ACCESSTOKEN_NAME] &&
      !req.cookies[env.REFRESHTOKEN_NAME]
    ) {
      return throwCustomError("사용자 로그인 정보를 찾을 수 없습니다.", 404);
    }
    res.clearCookie(env.ACCESSTOKEN_NAME);
    res.clearCookie(env.REFRESHTOKEN_NAME);
    return res.json({ message: "로그아웃 처리 되었습니다." });
  } catch (err) {
    console.log(err);
    if (err.status) {
      return res.status(err.status).json({ errorMessage: err.message });
    }
    next();
  }
});

module.exports = router;
