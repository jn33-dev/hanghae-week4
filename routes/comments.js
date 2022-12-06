const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth-middleware.js");
const {
  postCommentsSchema,
  CustomError,
  isBody,
} = require("../middlewares/validation-middleware");
const { Users, Posts, Comments, Likes } = require("../models");

// ######### 댓글 작성 api ##############
router.post("/:postId", authMiddleware, async (req, res) => {
  try {
    const { user } = res.locals;
    const { postId } = req.params;
    const { content } = await postCommentsSchema.validateAsync(req.body, {
      abortEarly: true,
    });
    const post = await Posts.findOne({
      where: { postId },
    });
    if (post === null) {
      throw new CustomError("존재하지 않는 게시글입니다.", 404);
    }
    await Comments.create({ userId: user.userId, postId, content });
    return res.status(201).json({ message: "댓글을 작성하였습니다." });
  } catch (err) {
    console.log(err);
    if (err.status) {
      res.status(err.status).send({ message: err.message });
      return;
    } else
      return res.status(400).send({ message: "댓글 작성에 실패하였습니다." });
  }
});

// ########### 댓글 목록 조회 ##############
router.get("/:postId", async (req, res) => {
  try {
    const { postId } = req.params;
    const data = await Comments.findAll({
      where: { postId },
      include: [{ model: Users, attributes: ["nickname"] }],
      order: [["createdAt", "DESC"]],
    });
    let comments = [];
    if (data.length) {
      data.forEach((e) => {
        comments.push({
          commentId: e.commentId,
          nickname: e.User.nickname,
          content: e.content,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        });
      });
    }
    return res.status(200).json({ data: comments });
  } catch (err) {
    console.log(err);
    return res.status(400).send({ message: "댓글 조회에 실패하였습니다." });
  }
});

// ########### 댓글 수정 api #################
router.put("/:commentId", authMiddleware, async (req, res) => {
  try {
    const { user } = res.locals;
    const { commentId } = req.params;
    const { content } = await postCommentsSchema.validateAsync(req.body, {
      abortEarly: true,
    });

    const data = await Comments.findOne({
      where: { commentId, userId: user.userId },
    });
    if (data === null) throw new CustomError("댓글이 존재하지 않습니다.", 404);
    const editComment = await Comments.update(
      { content },
      { where: { commentId } }
    );
    if (editComment === 0)
      throw new CustomError("댓글 수정이 정상적으로 처리되지 않았습니다.", 400);
    return res.status(200).send({ message: "댓글을 수정하였습니다." });
  } catch (err) {
    console.log(err);
    if (err.status) {
      res.status(err.status).send({ message: err.message });
      return;
    } else
      return res.status(400).send({ message: "댓글 수정에 실패하였습니다." });
  }
});

// ########## 댓글 삭제 api ####################
router.delete("/:commentId", authMiddleware, async (req, res) => {
  try {
    const { user } = res.locals;
    const { commentId } = req.params;
    const data = await Comments.findOne({
      where: { commentId, userId: user.userId },
    });
    if (data === null) throw new CustomError("댓글이 존재하지 않습니다.", 404);
    const delComment = await Comments.destroy({
      where: { commentId, userId: user.userId },
    });
    if (delComment === 0)
      throw new CustomError("댓글 삭제가 정상적으로 처리되지 않았습니다.", 401);
    return res.status(200).send({ message: "댓글을 삭제하였습니다." });
  } catch (err) {
    console.log(err);
    if (err.status) {
      res.status(err.status).send({ message: err.message });
      return;
    } else
      return res.status(400).send({ message: "댓글 삭제에 실패하였습니다." });
  }
});

module.exports = router;
