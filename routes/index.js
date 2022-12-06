const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware");

router.get("/", (req, res) => {
  res.send("항해10기 e반 4주차 6조 최예나의 Node.js 심화과정 개인과제 페이지");
});

// ####### 유저 내 정보 조회 ########

router.get("/login/me", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  res.send({
    user,
  });
});

module.exports = router;
