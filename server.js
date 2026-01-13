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
const uploadRoutes = require("./routes/upload");
const port = process.env.PORT || 3000;

// 在 server.js 中引入 child_process 用于执行 shell 命令
const { exec } = require("child_process");

// 启用 CORS 中间件
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "X-Requested-With",
      "Accept",
    ],
    credentials: true,
  })
);

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, Content-Length, X-Requested-With"
    );
    return res.sendStatus(200);
  }
  next();
});

// 添加解析请求体的中间件
app.use(express.json()); // 解析 JSON 格式的请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL-encoded 格式的请求体

// 关键代码：让 /uploads 路径映射到本地 uploads 文件夹
// 这样访问 http://api.你的域名.com/uploads/xxx.jpg 就能看到图片了
app.use("/uploads", express.static("uploads"));
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ 数据库连接成功！"))
  .catch((err) => console.error("❌ 数据库连接失败:", err));

// 2. 使用路由
app.use("/api/tasks", tasksRouter);
app.use("/api", authRouter);
app.use("/api/upload", uploadRoutes);

// 1. 定义路由 (Routing)
// 对比原生：不需要写一大堆 if (req.url === '/')
app.get("/", (req, res) => {
  // 2. 发送文件
  // 对比原生：不需要手动引入 fs，不需要手动处理 stream，不需要手动设置 Content-Type
  // res.sendFile 会自动帮你做完所有事情！
  const filePath = path.join(__dirname, "index.html");
  res.sendFile(filePath);
});

// 测试接口 （GET 请求）
app.get("/text", (req, res) => {
  res.json({
    message: "Hello World",
  });
});

// 注意：'/webhook-update' 这个路径你可以随便起个复杂的，防止被猜到
app.post("/webhook-update", (req, res) => {
  // 1. 简单的安全验证 (可选，防止路人误触发)
  // 我们约定：GitHub 必须带个 secret 密码
  const secret = req.query.secret;
  if (secret !== "my_super_secret_deploy_password") {
    return res.status(403).send("密码错误，别捣乱！");
  }

  console.log("收到 GitHub 更新通知，准备部署...");

  // 2. 先给 GitHub 回复成功 (否则 GitHub 会以为超时了)
  res.status(200).send("收到指令，开始更新！");

  // 3. 执行部署脚本 (这就是你昨天的 deploy.sh)
  // 这里的命令串起来：进入目录 -> 拉代码 -> 装依赖 -> 重启
  exec(
    "cd /var/www/app && git pull && npm install && pm2 restart todo-api",
    (error, stdout, stderr) => {
      if (error) {
        console.error(`执行出错: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    }
  );
});

// 3. 启动服务
app.listen(port, () => {
  console.log(`Express 服务器运行在 http://127.0.0.1:${port}`);
});
