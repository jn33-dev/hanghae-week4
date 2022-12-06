const express = require("express");
const router = express.Router();
const app = express();
const port = 3000;
const { Op } = require("sequelize");
const { Users, Posts, Comments, Likes } = require("./models");

app.use(express.json());

//####### req.body에서 json 형식 안 지켜졌을 때, Bison Error 처리########
app.use((error, request, response, next) => {
  if (error instanceof SyntaxError)
    response.status(404).send("req.body에서 json 형식을 확인해주세요.");
  else next();
});

const indexRouter = require("./routes/index");
app.use("/", indexRouter);

const userAndAuthRouter = require("./routes/usersAndAuth");
app.use("/", userAndAuthRouter);

const postsRouter = require("./routes/posts");
app.use("/posts", postsRouter);

const commentsRouter = require("./routes/comments");
app.use("/comments", commentsRouter);

app.listen(port, () => {
  console.log(port, "포트로 서버가 잘 열렸습니다!");
});
