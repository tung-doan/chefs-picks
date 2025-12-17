const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth-controller");

const router = express.Router();

const registerValidation = [
  body("name").trim().notEmpty().withMessage("名前は必須です"),
  body("email").isEmail().withMessage("メールアドレスの形式が正しくありません"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("パスワードは6文字以上である必要があります"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("ロールが無効です"),
];

const loginValidation = [
  body("email").isEmail().withMessage("メールアドレスの形式が正しくありません"),
  body("password").notEmpty().withMessage("パスワードは必須です"),
];

const forgotPasswordValidation = [
  body("email").isEmail().withMessage("メールアドレスの形式が正しくありません"),
];

const resetPasswordValidation = [
  body("email").isEmail().withMessage("メールアドレスの形式が正しくありません"),
  body("code").notEmpty().withMessage("コードが無効です"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("パスワードは6文字以上である必要があります"),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/logout", logout);
router.post("/forgot-password", forgotPasswordValidation, forgotPassword);
router.post("/reset-password", resetPasswordValidation, resetPassword);

module.exports = router;
