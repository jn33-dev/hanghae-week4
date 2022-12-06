const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const env = process.env;
const {
  postUserSchema,
  postAuthSchema,
} = require("../middlewares/validation-middleware");

//######## 회원가입 ############
router.post("/signup", async (req, res) => {
  try {
    const { nickname, password } = await postUserSchema.validateAsync(req.body);
    const existsUsers = await Users.findOne({ where: { nickname } });
    if (existsUsers) {
      res.status(412).send({ errorMessage: "중복된 닉네임입니다." });
      return;
    }
    await Users.create({ nickname, password });

    res.status(201).send({ message: "회원 가입에 성공하였습니다." });
  } catch (err) {
    console.log(err);
    if (err.name === "CustomError") {
      return res.status(err.status).send({ errorMessage: err.message });
    } else
      return res
        .status(400)
        .send({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
  }
});

//######## 로그인 ############
let tokenObject = {};
function createAccessToken(id) {
  return jwt.sign({ userId: id }, env.JWT_KEY, {
    expiresIn: "100s",
  });
}
function createRefreshToken() {
  return jwt.sign({}, env.JWT_KEY, {
    expiresIn: "7d",
  });
}
router.post("/login", async (req, res) => {
  try {
    const { nickname, password } = await postAuthSchema.validateAsync(req.body);
    const user = await Users.findOne({ where: { nickname } });

    if (!user || password !== user.password) {
      res
        .status(412)
        .send({ errorMessage: "닉네임 또는 패스워드를 확인해주세요." });
      return;
    }

    const accessToken = createAccessToken(user.userId);
    const refreshToken = createRefreshToken();

    tokenObject[refreshToken] = user.userId;
    res.cookie("accessToken", accessToken);
    res.cookie("refreshToken", refreshToken);

    return res
      .status(200)
      .send({ message: "Token이 정상적으로 발급되었습니다." });
  } catch (err) {
    console.log(err);
    if (err.name === "CustomError") {
      return res.status(err.status).send({ errorMessage: err.message });
    } else
      return res
        .status(400)
        .send({ errorMessage: "요청한 데이터 형식이 올바르지 않습니다." });
  }
});

module.exports = { router, tokenObject, createAccessToken, createRefreshToken };
