const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const env = process.env;
const {
  isPasswordIncludesNickname,
  postUserSchema,
  postAuthSchema,
} = require("../middlewares/validation-middleware");
const { createToken, tokenObject } = require("../util/jwtToken");
const throwCustomError = require("../error/customError");

//######## 회원가입 ############
router.post("/signup", async (req, res) => {
  try {
    const { nickname, password } = await postUserSchema.validateAsync(req.body);
    isPasswordIncludesNickname(password, nickname);
    const existsUsers = await Users.findOne({ where: { nickname } });
    if (existsUsers) {
      return throwCustomError("중복된 닉네임입니다.", 412);
      res.status(412).send({ errorMessage:  });
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
router.post("/login", async (req, res) => {
  try {
    const { nickname, password } = await postAuthSchema.validateAsync(req.body);
    const user = await Users.findOne({ where: { nickname } });

    if (!user || password !== user.password) {
      return throwCustomError("닉네임 또는 패스워드를 확인해주세요.", 412);
    }

    const accessToken = createToken(user.userId);
    const refreshToken = createToken("refreshToken");

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

module.exports = router;
