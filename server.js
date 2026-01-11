// server.js
require("dotenv").config();
const express = require("express"); // 引入 Express
const cors = require("cors");
const path = require("path"); // 还是需要 path 模块处理路径
const app = express(); // 创建一个 Express 应用实例
const mongoose = require("mongoose");
// 1. 引入拆分出去的路由文件
const tasksRouter = require("./routes/tasks");
const authRouter = require("./routes/auth");

const port = process.env.PORT || 3000;

// 启用 CORS 中间件
app.use(cors());

// 添加解析请求体的中间件
app.use(express.json()); // 解析 JSON 格式的请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL-encoded 格式的请求体

const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ 数据库连接成功！"))
  .catch((err) => console.error("❌ 数据库连接失败:", err));

// 2. 使用路由
app.use("/api/tasks", tasksRouter);
app.use("/api", authRouter);

// 1. 定义路由 (Routing)
// 对比原生：不需要写一大堆 if (req.url === '/')
app.get("/", (req, res) => {
  // 2. 发送文件
  // 对比原生：不需要手动引入 fs，不需要手动处理 stream，不需要手动设置 Content-Type
  // res.sendFile 会自动帮你做完所有事情！
  const filePath = path.join(__dirname, "index.html");
  res.sendFile(filePath);
});

// 3. 启动服务
app.listen(port, () => {
  console.log(`Express 服务器运行在 http://127.0.0.1:${port}`);
});
