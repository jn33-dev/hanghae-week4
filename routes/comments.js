const express = require("express");
const router = express.Router();
const Comments = require("../schemas/comment");
const Posts = require("../schemas/post");

class CustomError {
  constructor(message, status) {
    this.name = "CustomError";
    this.message = message;
    this.status = status;
  }
}

function isBody(req, res) {
  if (!Object.values(req.body).length || Object.values(req.body).includes("")) {
    throw new CustomError("데이터 형식이 올바르지 않습니다.", 400);
  }
  return;
}

// 1.댓글 작성 api (postId, user, password, content, createdAt)
router.post("/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    const { user, password, content } = req.body;
    if (!content || !content.length)
      throw new CustomError("댓글 내용을 입력해주세요.", 404);
    await isBody(req, res);
    const post = await Posts.findOne({ _id: { $eq: _postId } });
    if (post === null) {
      throw new CustomError("게시글 조회에 실패했습니다.", 404);
    }
    const createdAt = new Date().toISOString();
    await Comments.create({
      postId: _postId,
      createdAt,
      user,
      password,
      content,
    });
    return res.status(201).json({ message: "댓글을  생성하였습니다." });
  } catch (err) {
    console.log(err);
    if (!err.status) {
      return res
        .status(400)
        .send({ message: "데이터 형식이 올바르지 않습니다." });
    } else return res.status(err.status).send({ message: err.message });
  }
});

// 2. 댓글 목록 조회
router.get("/:_postId", async (req, res) => {
  try {
    const { _postId } = req.params;
    const post = await Posts.findOne({ _id: { $eq: _postId } });
    if (post === null)
      throw new CustomError("게시글 조회에 실패했습니다.", 404);
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
    return res.status(200).json({ data: comments });
  } catch (err) {
    console.log(err);
    if (!err.status) {
      return res
        .status(400)
        .send({ message: "데이터 형식이 올바르지 않습니다." });
    } else return res.status(err.status).send({ message: err.message });
  }
});

// 3. 댓글 수정 api (commentId, password, content)
router.put("/:_commentId", async (req, res) => {
  try {
    const { _commentId } = req.params;
    const { password, content } = req.body;
    if (!content || !content.length)
      throw new CustomError("댓글 내용을 입력해주세요", 400);
    await isBody(req, res);

    const data = await Comments.findOneAndUpdate(
      { _id: { $eq: _commentId }, password: { $eq: password } },
      { $set: { content } }
    );
    if (data === null) throw new CustomError("댓글 조회에 실패했습니다.", 404);
    return res
      .status(200)
      .send({ message: "댓글을 성공적으로 수정하였습니다!" });
  } catch (err) {
    console.log(err);
    if (!err.status) {
      return res
        .status(400)
        .send({ message: "데이터 형식이 올바르지 않습니다." });
    } else return res.status(err.status).send({ message: err.message });
  }
});

// 4. 댓글 삭제 api (commentId, password)
router.delete("/:_commentId", async (req, res) => {
  try {
    const { _commentId } = req.params;
    const { password } = req.body;
    await isBody(req, res);

    const data = await Comments.findOneAndDelete({
      _id: { $eq: _commentId },
      password: { $eq: password },
    });
    if (data === null) throw new CustomError("댓글 조회에 실패했습니다.", 404);
    return res
      .status(200)
      .send({ message: "댓글을 성공적으로 삭제하였습니다!" });
  } catch (err) {
    console.log(err);
    if (!err.status) {
      return res
        .status(400)
        .send({ message: "데이터 형식이 올바르지 않습니다." });
    } else return res.status(err.status).send({ message: err.message });
  }
});

module.exports = router;
