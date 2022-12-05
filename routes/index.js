const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("항해10기 e반 3주차 4조 최예나의 개인프로젝트입니다.");
});

module.exports = router;
