// server.js

// 1. 引入 Node.js 内置的 'http' 模块
const http = require("http");
const fs = require("fs");
const path = require("path");
// 2. 定义主机名和端口
const hostname = "127.0.0.1"; // 本机地址
const port = 3000; // 端口号

// 3. 创建服务器
// req (Request): 获取客户端发来的请求信息（如 URL, 参数）
// res (Response): 用来给客户端发送响应
const server = http.createServer((req, res) => {
  if (req.url === "/") {
    const filePath = path.join(__dirname, "index.html");

    fs.readFile(filePath, "utf-8", (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end("500 Internal Server Error - 服务器内部错误");
        return;
      }

      res.statusCode = 200;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.end(data);
    });
  } else {
    res.statusCode = 404;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("404 Not Found");
  }
});

// 4. 启动服务器并监听端口
server.listen(port, hostname, () => {
  console.log(`服务器运行在 http://${hostname}:${port}/`);
  console.log("按 Ctrl + C 可以停止服务器");
});
