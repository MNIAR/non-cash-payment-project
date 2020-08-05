const express = require('express');
const router = express.Router();
const ctrl = require("./user.ctrl");

// 라우팅 설정
router.get("/signup", ctrl.showSignupPage); // 회원가입 페이지
router.get("/login", ctrl.showLoginPage); // 로그인페이지
router.get("/hello", ctrl.showUserPage);
router.get("/userInfo", ctrl.showInfoPage);
router.get("/logout", ctrl.logout);
router.put("/infoUpdate", ctrl.infoUpdate);
router.post("/signup", ctrl.signup); // 회원 가입
router.post("/login", ctrl.login); // 로그인
router.post("/getBarcodeId", ctrl.getBarcodeId); // 바코드 get

module.exports = router;