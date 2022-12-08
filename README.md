# 항해 99 10기 4주차 Node.js 숙련주차 개인과제
 - 게시판 CRUD에 회원가입, 로그인, 좋아요 기능을 추가했습니다.
 - mongoDB에서 AWS RDS를 사용하여 MYSQL db를 사용하였습니다.
 - Joi를 사용하여 req.body 객체 검사 로직을 추가하였습니다.
 - ERD 링크 : https://drawsql.app/teams/hanghae-week4/diagrams/personal-project-board
  

## 구현기능
 - 회원가입 : POST /signup
 - 로그인 : POST /login
 - 게시글 포스팅 : POST domain/posts
 - 게시글 리스팅 : GET domain/posts
 - 게시글 상세 조회 : GET domain/posts/:postId
 - 게시글 수정 : PUT domain/posts/:postId
 - 게시글 삭제 : DELETE domain/posts/:postId
 - 댓글 포스팅 : POST domain/comments/:postId
 - 댓글 리스팅 : GET domain/comments/:postId
 - 댓글 수정 : PUT domain/comments/:commentId
 - 댓글 삭제 : DELETE domain/comments/:commentId
 - 좋아요 게시글 조회 : GET /posts/like
 - 게시글 좋아요 : PUT /posts/:postId/like 

##### 사용 기술
 - JavaScript
 - Node.js
   - express
   - mysql2
   - sequelize
   - joi
   - jsonwebtoken
 - Amazon RDS / MYSQL