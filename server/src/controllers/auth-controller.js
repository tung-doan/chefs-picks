const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const User = require("../models/user-model");
const { signToken } = require("../utils/jwt");

// POST /api/auth/register
const register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array().map((err) => err.msg),
    });
  }

  const { name, email, password, role = "user" } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email đã được đăng ký",
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
      message: "Đăng ký thành công",
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
      message: "Lỗi máy chủ",
    });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Dữ liệu không hợp lệ",
      errors: errors.array().map((err) => err.msg),
    });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Tài khoản không tồn tại",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email hoặc mật khẩu không đúng",
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
      message: "Đăng nhập thành công",
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
      message: "Lỗi máy chủ",
    });
  }
};

const logout = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET || "dev-secret";

  try {
    jwt.verify(token, secret);
    return res.status(200).json({
      success: true,
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Vui lòng đăng nhập",
    });
  }
};

module.exports = {
  register,
  login,
  logout,
};
