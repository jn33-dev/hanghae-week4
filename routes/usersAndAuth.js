const express = require("express");
const router = express.Router();
const { Users, Posts, Comments, Likes } = require("../models");
const Joi = require("joi");

class CustomError {
  constructor(message, status) {
    this.name = "CustomError";
    this.message = message;
    this.status = status;
  }
}

//######## 회원가입 ############
const postUserSchema = Joi.object({
  nickname: Joi.string()
    .alphanum()
    .min(3)
    .required()
    .error(() => {
      throw new CustomError("ID의 형식이 일치하지 않습니다.", 412);
    }),

  password: Joi.string()
    .min(4)
    .invalid(Joi.ref("nickname"))
    .required()
    .error(() => {
      throw new CustomError("password의 형식이 일치하지 않습니다.", 412);
    }),

  confirmPassword: Joi.valid(Joi.ref("password")).error(() => {
    throw new CustomError("password가 일치하지 않습니다.", 412);
  }),
});

router.post("/users", async (req, res) => {
  try {
    const { nickname, password } = await postUserSchema.validateAsync(req.body);

    const existsUsers = await Users.findByPk(nickname);
    if (existsUsers) {
      res.status(412).send({ errorMessage: "중복된 닉네임입니다." });
      return;
    }

    await Users.create({ nickname, password });
    res.status(201).send({ message: "회원 가입에 성공하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).send({ errorMessage: err.message });
  }
});

module.exports = router;
