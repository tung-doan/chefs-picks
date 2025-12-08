const express = require("express");
const { body } = require("express-validator");
const { register, login, logout } = require("../controllers/auth-controller");

const router = express.Router();

const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name là bắt buộc"),
  body("email").isEmail().withMessage("Email không đúng định dạng"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password phải có ít nhất 6 ký tự"),
  body("role")
    .optional()
    .isIn(["user", "admin"])
    .withMessage("Role không hợp lệ"),
];

const loginValidation = [
  body("email").isEmail().withMessage("Email không đúng định dạng"),
  body("password").notEmpty().withMessage("Password là bắt buộc"),
];

router.post("/register", registerValidation, register);
router.post("/login", loginValidation, login);
router.post("/logout", logout);

module.exports = router;
