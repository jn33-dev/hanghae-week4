const express = require("express");
const router = express.Router();

const user = require("./user");
const postsRouter = require("./posts");
const commentsRouter = require("./comments");

router.get("/", (req, res) => {
  res
    .status(200)
    .send("항해 10기 E반 최예나의 4주차 Node.js 숙련주차 개인과제");
});
router.use(user);
router.use("/posts", postsRouter);
router.use("/comments", commentsRouter);

module.exports = router;
