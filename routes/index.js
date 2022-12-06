const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("항해10기 e반 4주차 6조 최예나의 Node.js 심화과정 개인과제 페이지");
});

module.exports = router;
