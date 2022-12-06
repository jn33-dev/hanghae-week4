const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware.js");
const {
  postPostsSchema,
  CustomError,
  isBody,
} = require("../middlewares/validation-middleware");
const { Users, Posts, Comments, Likes } = require("../models");

// ######### 게시글 작성 api ############
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { user } = res.locals;
    await isBody(req, res);
    const { title, content } = await postPostsSchema.validateAsync(req.body, {
      abortEarly: true,
    });
    await Posts.create({ userId: user.userId, title, content });
    return res.status(201).json({ message: "게시글을 생성하였습니다." });
  } catch (err) {
    console.log(err);
    if (err.status) {
      return res.status(err.status).send({ errMessage: err.message });
    } else
      return res
        .status(400)
        .send({ errorMessage: "게시글 작성에 실패했습니다." });
  }
});

// ######## 게시글 목록 조회 #########
// 로그인 필요 없음
router.get("/", async (req, res) => {
  try {
    const data = await Posts.findAll({
      include: [
        { model: Users, attributes: ["nickname"] },
        { model: Likes, as: "Likes", attributes: ["likeId"] },
      ],
      order: [["createdAt", "DESC"]],
    });
    let posts = [];
    data.forEach((e) => {
      posts.push({
        postId: e.postId,
        userId: e.userId,
        nickname: e.User.nickname,
        title: e.title,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        likes: e.Likes.length,
      });
    });
    return res.status(200).json({ data: posts });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

// ######### 게시글 상세 조회 api #############
// 로그인 필요 없음
router.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const data = await Posts.findOne({
      where: { postId },
      include: [
        { model: Users, attributes: ["nickname"] },
        { model: Likes, as: "Likes", attributes: ["likeId"] },
        {
          model: Comments,
          as: "Comments",
          order: [["createdAt", "DESC"]],
          attributes: ["commentId", "content", "createdAt", "updatedAt"],
          include: [{ model: Users, attributes: ["nickname"] }],
        },
      ],
    });
    if (data === null)
      throw new CustomError("게시글 조회에 실패했습니다.", 400);
    let comments = [];
    if (data.Comments.length) {
      data.Comments.forEach((e) => {
        comments.push({
          commentId: e.commentId,
          nickname: e.User.nickname,
          content: e.content,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        });
      });
    }
    // 게시글 상세조회 + 댓글 목록을 res로 쏴주기
    return res.status(200).json({
      data: {
        postId: data.postId,
        userId: data.userId,
        nickname: data.User.nickname,
        title: data.title,
        content: data.content,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        likes: data.Likes.length,
        comments,
      },
    });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

// ######### 게시글 수정 api #############
router.put("/:postId", authMiddleware, async (req, res) => {
  try {
    const { user } = res.locals;
    await isBody(req, res);
    const { postId } = req.params;
    const { title, content } = await postPostsSchema.validateAsync(req.body, {
      abortEarly: true,
    });
    const data = await Posts.findOne({
      where: { postId, userId: user.userId },
    });
    if (data === null)
      throw new CustomError("게시글이 정상적으로 수정되지 않았습니다.", 401);
    await Posts.update({ title, content }, { where: { postId } });
    return res.status(200).send({ message: "게시글을 수정하였습니다." });
  } catch (err) {
    console.log(err);
    if (err.status) {
      return res.status(err.status).send({ errMessage: err.message });
    } else
      return res
        .status(400)
        .send({ errorMessage: "게시글 수정에 실패했습니다." });
  }
});

// ########### 게시글 삭제 api ##################
router.delete("/:postId", authMiddleware, async (req, res) => {
  try {
    const { user } = res.locals;
    const { postId } = req.params;
    const data = await Posts.findOne({
      where: { postId },
    });
    if (data === null)
      throw new CustomError("게시글이 존재하지 않습니다.", 404);
    const delPost = await Posts.destroy({
      where: { postId, userId: user.userId },
    });
    if (delPost === 0) {
      throw new CustomError("게시글이 정상적으로 삭제되지 않았습니다.", 401);
    }
    return res.status(200).send({ message: "게시글을 삭제하였습니다." });
  } catch (err) {
    console.log(err);
    if (err.status) {
      return res.status(err.status).send({ message: err.message });
    } else
      return res.status(400).send({ message: "게시글 삭제에 실패하였습니다." });
  }
});

// ######### 좋아요 게시글 조회! #######
router.get("/like", authMiddleware, async (req, res) => {
  try {
    const { user } = res.locals;
    const data = await Likes.findAll({
      where: { userId: user.userId },
      include: [
        { model: Users, attributes: ["nickname"] },
        {
          model: Posts,
          attributes: { exclude: ["content"] },
          include: { model: Likes, as: "Likes", attributes: ["likeId"] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    let posts = [];
    data.forEach((e) => {
      posts.push({
        postId: e.postId,
        userId: e.userId,
        nickname: e.User.nickname,
        title: e.title,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        likes: e.Likes.length,
      });
    });
    return res.status(200).json({ data: posts });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ errorMessage: "게시글 조회에 실패하였습니다." });
  }
});

module.exports = router;
