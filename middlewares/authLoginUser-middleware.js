require("dotenv").config();
const env = process.env;

// 로그인 되어 있는 유저일 경우 Error를 반환한다.
module.exports = async (req, res, next) => {
  try {
    console.log(req.cookies[env.ACCESSTOKEN_NAME]);
    if (
      req.cookies[env.ACCESSTOKEN_NAME] ||
      req.cookies[env.REFRESHTOKEN_NAME]
    ) {
      return res.status(403).send({
        errorMessage: "이미 로그인이 되어있습니다.",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    return res.status(400).send({
      errorMessage: "잘못된 접근입니다.",
    });
  }
};
