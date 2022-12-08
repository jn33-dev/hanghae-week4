const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware.js");
const {
  postPostsSchema,
  isBody,
} = require("../middlewares/validation-middleware");
const throwCustomError = require("../error/errorFunction");
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
router.get("/:postId", async (req, res, next) => {
  try {
    const { postId } = req.params;
    if (postId === "like") return next();
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
    if (data === null) throwCustomError("게시글 조회에 실패했습니다.", 400);
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
      throwCustomError("게시글이 정상적으로 수정되지 않았습니다.", 401);
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
    if (data === null) throwCustomError("게시글이 존재하지 않습니다.", 404);
    const delPost = await Posts.destroy({
      where: { postId, userId: user.userId },
    });
    if (delPost === 0) {
      throwCustomError("게시글이 정상적으로 삭제되지 않았습니다.", 401);
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
        {
          model: Posts,
          attributes: { exclude: ["content", "postId"] },
          include: [
            { model: Likes, as: "Likes", attributes: ["likeId"] },
            { model: Users, attributes: ["nickname"] },
          ],
        },
      ],
    });
    let posts = [];
    data.forEach((e) => {
      posts.push({
        postId: e.postId,
        userId: e.Post.userId,
        nickname: e.Post.User.nickname,
        title: e.Post.title,
        createdAt: e.createdAt,
        updatedAt: e.updatedAt,
        likes: e.Post.Likes.length,
      });
    });
    posts.sort((a, b) => b.likes - a.likes);

    return res.status(200).json({ data: posts });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ errorMessage: "좋아요 게시글 조회에 실패하였습니다." });
  }
});

// ######### 게시글 좋아요 #######
router.put("/:postId/like", authMiddleware, async (req, res) => {
  try {
    const { user } = res.locals;
    console.log("user.userId:", user.userId);
    const { postId } = req.params;
    const post = await Posts.findOne({
      where: { postId },
      attributes: ["postID"],
    });
    if (post === null) throwCustomError("게시글이 존재하지 않습니다.", 404);
    // 게시글이 존재하는 경우, 좋아요를 클릭한 유저가 기존에 좋아요를 눌렀는지 확인하고, 눌렀으면 삭제, 누르지 않았으면 생성
    const isLike = await Likes.findAll({
      where: { postId },
      attributes: ["userId"],
    });
    if (isLike.filter((e) => e.userId === user.userId).length) {
      await Likes.destroy({ where: { postId, userId: user.userId } });
      return res
        .status(201)
        .send({ message: "게시글의 좋아요를 취소하였습니다." });
    } else {
      await Likes.create({ postId, userId: user.userId });
      return res
        .status(201)
        .send({ message: "게시물에 좋아요를 등록하였습니다." });
    }
  } catch (err) {
    console.log(err);
    if (err.status) {
      return res.status(err.status).send({ message: err.message });
    } else
      return res
        .status(400)
        .send({ message: "게시글 좋아요에 실패하였습니다." });
  }
});

module.exports = router;
