const Joi = require("joi");

class CustomError {
  constructor(message, status) {
    this.name = "CustomError";
    this.message = message;
    this.status = status;
  }
}

const postUserSchema = Joi.object({
  nickname: Joi.string()
    .alphanum()
    .min(3)
    .required()
    .error(() => {
      throw new CustomError("닉네임 형식이 일치하지 않습니다.", 412);
    }),

  password: Joi.string()
    .min(4)
    .invalid(Joi.ref("nickname"))
    .required()
    .error(() => {
      throw new CustomError("패스워드 형식이 일치하지 않습니다.", 412);
    }),

  confirmPassword: Joi.valid(Joi.ref("password")).error(() => {
    throw new CustomError("패스워드가 일치하지 않습니다.", 412);
  }),
});

const postAuthSchema = Joi.object({
  nickname: Joi.required().error(() => {
    throw new CustomError("닉네임을 입력해주세요.", 404);
  }),
  password: Joi.required().error(() => {
    throw new CustomError("패스워드를 입력해주세요.", 400);
  }),
});

const postPostsSchema = Joi.object({
  title: Joi.string()
    .min(2)
    .required()
    .error(() => {
      throw new CustomError("게시글 제목의 형식이 일치하지 않습니다.", 412);
    }),
  content: Joi.string()
    .min(2)
    .required()
    .error(() => {
      throw new CustomError("게시글 내용의 형식이 일치하지 않습니다.", 412);
    }),
});

function isBody(req, res) {
  if (!Object.values(req.body).length) {
    throw new CustomError("데이터 형식이 올바르지 않습니다.", 412);
  }
  return;
}

module.exports = {
  CustomError,
  postUserSchema,
  postAuthSchema,
  postPostsSchema,
  isBody,
};