const express = require("express");
const router = express.Router();
const app = express();
const port = 3000;
const { Op } = require("sequelize");
const { Users, Posts, Comments, Likes } = require("./models");
const Joi = require("joi");

app.get("/", (req, res) => {
  res.status(200).send(`항해 4주차, Node.js 심화과정 개인과제 페이지`);
});

app.use(express.json());

//####### req.body에서 json 형식 안 지켜졌을 때, Byson Error 처리########
app.use((error, request, response, next) => {
  if (error instanceof SyntaxError)
    response.status(404).send("req.body에서 json 형식을 확인해주세요.");
  else next();
});

const userAndAuthRouter = require("./routes/usersAndAuth");
app.use("/", userAndAuthRouter);

// const indexRouter = require("./routes/index");
// app.use("/", indexRouter);

// const postsRouter = require("./routes/posts");
// app.use("/posts", postsRouter);

// const commentsRouter = require("./routes/comments");
// const router = require("./routes/comments");
// app.use("/comments", commentsRouter);

app.listen(port, () => {
  console.log(port, "포트로 서버가 잘 열렸습니다!");
});
