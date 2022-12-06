const express = require("express");
const {
  postPostsSchema,
  CustomError,
  isBody,
} = require("../middlewares/validation-middleware");
const router = express.Router();
const { Users, Posts, Comments, Likes } = require("../models");
authMiddleware = require("../middlewares/auth-middleware.js");

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
    if (err.name === "CustomError") {
      return res.status(err.status).send({ errMessage: err.message });
    } else
      return res
        .status(400)
        .send({ errorMessage: "게시글 작성에 실패했습니다." });
  }
});

// ######## 게시글 조회 #########
router.get("/", authMiddleware, async (req, res) => {
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
router.get("/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    const data = await Posts.findOne(
      {
        _id: { $eq: _postId },
      },
      { password: false }
    );
    if (data === null)
      throw new CustomError("게시글 조회에 실패했습니다.", 404);

    // 해당 게시글 댓글 조회
    const comment = await Comments.find(
      { postId: { $eq: _postId } },
      { password: false }
    ).sort({ createdAt: -1 });
    comments = [];
    if (comment.length) {
      comment.forEach((e) => {
        comments.push({
          postId: e["_id"],
          user: e["user"],
          content: e["content"],
          createdAt: e["createdAt"],
        });
      });
    } else {
      comments.push("유효한 댓글 데이터가 없습니다.");
    }

    // 게시글 상세조회 + 댓글 목록을 res로 쏴주기
    return res.status(200).json({
      data: {
        postId: data["_id"],
        user: data["user"],
        title: data["title"],
        content: data["content"],
        createdAt: data["createdAt"],
      },
      comments,
    });
  } catch (err) {
    console.log(err);
    if (!err.status) {
      return res
        .status(400)
        .send({ message: "데이터 형식이 올바르지 않습니다." });
    } else return res.status(err.status).send({ message: err.message });
  }
});

// 4.게시글 수정 api (postId, password, title, content)
router.put("/:_postId", async (req, res) => {
  try {
    await isBody(req, res);
    const { _postId } = req.params;
    const { password, title, content } = req.body;
    const data = await Posts.findOneAndUpdate(
      { _id: { $eq: _postId }, password: { $eq: password } },
      { $set: { title, content } }
    );
    if (data === null) {
      throw new CustomError("게시글 조회에 실패했습니다.", 404);
    }

    return res.status(200).send({ message: "게시글을 수정하였습니다." });
  } catch (err) {
    console.log(err);
    if (!err.status) {
      return res.status(404).send({ message: "게시글 조회에 실패했습니다." });
    } else return res.status(err.status).send({ message: err.message });
  }
});

// 5.게시글 삭제 api (postId, password)
router.delete("/:_postId", async (req, res) => {
  try {
    await isBody(req, res);
    const { _postId } = req.params;
    const { password } = req.body;
    const data = await Posts.findOneAndDelete({
      _id: { $eq: _postId },
      password: { $eq: password },
    });
    if (data === null)
      throw new CustomError("게시글 조회에 실패했습니다.", 404);
    return res.status(200).send({ message: "게시글을 삭제하였습니다." });
  } catch (err) {
    console.log(err);
    if (!err.status) {
      return res.status(404).send({ message: "게시글 조회 실패" });
    } else return res.status(err.status).send({ message: err.message });
  }
});

module.exports = router;
