// middleware/auth.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY; // 从环境变量中读取

// 中间件函数的标准签名：req, res, next
const authMiddleware = (req, res, next) => {
  // 1. 从请求头获取 Token
  // 前端通常会发：Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "未授权：请先登录" });
  }

  // 取出 Bearer 后面的 token 字符串
  const token = authHeader.split(" ")[1];

  try {
    // 2. 验证 Token
    const decoded = jwt.verify(token, SECRET_KEY);

    // 3. 把用户信息挂载到 req 对象上
    // 这样后续的路由就能知道是谁在发请求了！
    req.user = decoded;

    // 4. 放行！继续走下一个环节
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token 无效或已过期" });
  }
};

module.exports = authMiddleware;
