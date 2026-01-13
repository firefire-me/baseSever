require("dotenv").config();
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs"); // 引入加密库
const jwt = require("jsonwebtoken"); // 引入 JWT 库

// 密钥 (从环境变量中读取)
const SECRET_KEY = process.env.SECRET_KEY;

// 1. 注册接口 (C - Create)
// 真正的将数据写入数据库
router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // 1. 生成盐 (Salt) 并加密密码
  // hashSync 是同步方法，简单直接
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  try {
    // 实例化一个 User 对象
    const newUser = new User({
      username,
      password: hashedPassword, // 存储加密后的密码
    });

    // 保存到数据库 (这是一个异步操作，记得用 await)
    await newUser.save();

    res.json({ success: true, message: "注册成功！" });
  } catch (error) {
    // 如果出错（比如用户名重复），Mongoose 会抛出错误
    console.error(error);
    res.status(500).json({
      success: false,
      message: "注册失败，用户名可能已存在",
      error: error,
    });
  }
});

// 2. 登录接口 (R - Read)
// 去数据库查询数据
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  // 使用 findOne 方法查找
  const user = await User.findOne({ username: username });

  // 如果找不到用户
  if (!user) {
    return res.status(401).json({ success: false, message: "用户不存在" });
  }

  // 1. 验证密码 (比对明文和数据库里的密文)
  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "密码错误" });
  }
  // 2. 生成 Token
  // payload: 你想在 Token 里藏什么信息 (比如用户 ID)
  const token = jwt.sign(
    { id: user._id, username: user.username }, // Payload
    SECRET_KEY, // 密钥
    { expiresIn: "1w" } // 过期时间1周有效期
  );
  // 3. 返回 Token 给前端
  res.json({
    success: true,
    message: "登录成功",
    token: token,
  });
});

module.exports = router;
