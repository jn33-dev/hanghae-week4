const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const env = process.env;
const {
  postUserSchema,
  postAuthSchema,
} = require("../middlewares/validation-middleware");
authMiddleware = require("../middlewares/auth-middleware.js");

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

    res.send({ token: jwt.sign({ userId: user.userId }, env.JWT_KEY) });
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

// ####### 유저 내 정보 조회 ########

router.get("/login/me", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  res.send({
    users: {
      userId: user.userId,
      nickname: user.nickname,
    },
  });
});

module.exports = router;
