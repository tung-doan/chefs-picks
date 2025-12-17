const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const User = require("../models/user-model");
const { signToken } = require("../utils/jwt");
const { sendMail } = require("../utils/email");

const RESET_TOKEN_EXPIRATION_MINUTES =
  Number(process.env.RESET_TOKEN_EXPIRATION_MINUTES) || 30;
const RESET_PASSWORD_URL =
  process.env.RESET_PASSWORD_URL || "http://localhost:3000/reset-password";

const generateResetCode = () => {
  const code = Math.floor(100000 + Math.random() * 900000);
  return code.toString();
};

// POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "データが無効です",
      errors: errors.array().map((err) => err.msg),
    });
  }

  const { name, email, password, role = "user" } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "メールアドレスは既に登録されています",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    const token = signToken({
      userId: user._id,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      success: true,
      message: "登録が成功しました",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "サーバーエラー",
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "データが無効です",
      errors: errors.array().map((err) => err.msg),
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "アカウントが存在しません",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "メールアドレスまたはパスワードが正しくありません",
      });
    }

    const token = signToken(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      success: true,
      message: "ログインが成功しました",
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "サーバーエラー",
    });
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "データが無効です",
      errors: errors.array().map((err) => err.msg),
    });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "メールアドレスが存在する場合、リセットコードを送信しました",
      });
    }

    const code = generateResetCode();
    const hashedToken = crypto.createHash("sha256").update(code).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires =
      Date.now() + RESET_TOKEN_EXPIRATION_MINUTES * 60 * 1000;

    await user.save();

    const mailHtml = `
      <p>Xin chao ${user.name || "ban"},</p>
      <p>Ma xac thuc dat lai mat khau cua ban la:</p>
      <h2>${code}</h2>
      <p>Ma het han trong ${RESET_TOKEN_EXPIRATION_MINUTES} phut.</p>
      <p>Neu ban khong yeu cau, vui long bo qua email nay.</p>
    `;

    await sendMail({
      to: email,
      subject: "Ma reset mat khau",
      html: mailHtml,
      text: `Ma reset mat khau: ${code}. Het han trong ${RESET_TOKEN_EXPIRATION_MINUTES} phut.`,
    });

    return res.status(200).json({
      success: true,
      message: "リセットコードをメールで送信しました（メールアドレスが存在する場合）",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "パスワードリセットメールを送信できませんでした",
    });
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "データが無効です",
      errors: errors.array().map((err) => err.msg),
    });
  }

  const { email, code, newPassword } = req.body;

  try {
    const hashedToken = crypto.createHash("sha256").update(code).digest("hex");

    const user = await User.findOne({
      email,
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "コードが無効または期限切れです",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "パスワードリセットが成功しました",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "パスワードをリセットできませんでした",
    });
  }
};

const logout = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "ログインしてください",
    });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "dev-secret";

  try {
    jwt.verify(token, secret);
    return res.status(200).json({
      success: true,
      message: "ログアウトが成功しました",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "ログインしてください",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  forgotPassword,
  resetPassword,
};
