const express = require("express");
const router = express.Router();
const Posts = require("../schemas/post");
const Comments = require("../schemas/comment");

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

// 1.게시글 작성 api
router.post("/", async (req, res) => {
  try {
    await isBody(req, res);
    const { user, password, title, content } = req.body;
    const createdAt = new Date().toISOString();
    await Posts.create({
      createdAt,
      user,
      password,
      title,
      content,
    });
    return res.status(201).json({ message: "게시글을 생성하였습니다." });
  } catch (err) {
    console.log(err);
    return res
      .status(400)
      .send({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

// 2.게시글 조회 api (postId, user, title, createdAt)
router.get("/", async (req, res) => {
  try {
    const data = await Posts.find({}, { password: false, content: false }).sort(
      { createdAt: -1 }
    );
    let posts = [];
    data.forEach((e) => {
      posts.push({
        postId: e["_id"],
        user: e["user"],
        title: e["title"],
        createdAt: e["createdAt"],
      });
    });
    return res.status(200).json({ data: posts });
  } catch (err) {
    console.log(err);
    if (!err.status) {
      return res
        .status(400)
        .send({ message: "데이터 형식이 올바르지 않습니다." });
    } else return res.status(err.status).send({ message: err.message });
  }
});

// 3.게시글 상세 조회 api (postId, user, title, content, createdAt)
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
