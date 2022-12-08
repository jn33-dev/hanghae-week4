const express = require("express");
const app = express();
require("dotenv");
const env = process.env;
const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());
//####### req.body에서 json 형식 안 지켜졌을 때, Bison Error 처리########

const indexRouter = require("./routes/index");
app.use("/", indexRouter);

app.use((error, req, res, next) => {
  if (error instanceof SyntaxError)
    res.status(404).send("req.body에서 json 형식을 확인해주세요.");
  else {
    console.error(error);
    return res
      .status(400)
      .json({ errorMessage: "알 수 없는 에러가 발생했습니다." });
  }
});

app.listen(env.EXPRESS_PORT, () => {
  console.log(env.EXPRESS_PORT, "포트로 서버가 잘 열렸습니다!");
});
