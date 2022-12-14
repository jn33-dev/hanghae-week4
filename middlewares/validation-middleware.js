const Joi = require("joi");
const throwCustomError = require("../error/errorFunction");

const postUserSchema = Joi.object({
  nickname: Joi.string()
    .alphanum()
    .min(3)
    .required()
    .error(() => {
      throwCustomError("닉네임 형식이 일치하지 않습니다.", 412);
    }),

  password: Joi.string()
    .min(4)
    .required()
    .error(() => {
      throwCustomError("패스워드 형식이 일치하지 않습니다.", 412);
    }),

  confirmPassword: Joi.valid(Joi.ref("password"))
    .required()
    .error(() => {
      throwCustomError("패스워드가 일치하지 않습니다.", 412);
    }),
});

function isPasswordIncludesNickname(password, nickname) {
  if (password.includes(nickname))
    throwCustomError("패스워드에 닉네임이 포함되어 있습니다.", 412);
  return;
}

const postAuthSchema = Joi.object({
  nickname: Joi.required().error(() => {
    throwCustomError("닉네임을 입력해주세요.", 404);
  }),
  password: Joi.required().error(() => {
    throwCustomError("패스워드를 입력해주세요.", 400);
  }),
});

const postPostsSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .required()
    .error(() => {
      throwCustomError("게시글 제목의 형식이 일치하지 않습니다.", 412);
    }),
  content: Joi.string()
    .min(2)
    .required()
    .error(() => {
      throwCustomError("게시글 내용의 형식이 일치하지 않습니다.", 412);
    }),
});

function isBody(req, res) {
  if (!Object.values(req.body).length) {
    throwCustomError("데이터 형식이 올바르지 않습니다.", 412);
  }
  return;
}

const postCommentsSchema = Joi.object({
  content: Joi.string()
    .min(2)
    .required()
    .error(() => {
      throwCustomError("데이터 형식이 일치하지 않습니다.", 412);
    }),
});

module.exports = {
  postUserSchema,
  isPasswordIncludesNickname,
  postAuthSchema,
  postPostsSchema,
  isBody,
  postCommentsSchema,
};
