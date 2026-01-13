// middleware/upload.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 1. 确保上传目录存在
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 2. 配置存储引擎
const storage = multer.diskStorage({
  // 目的地：存到 uploads 文件夹
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  // 文件名：时间戳-随机数.后缀 (防止重名覆盖)
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    // 简单点，直接用 fieldname-时间戳.后缀
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// 3. 文件过滤 (可选，只允许图片)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("只允许上传图片！"), false);
  }
};

// 4. 导出配置
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 限制 5MB
  fileFilter: fileFilter,
});

module.exports = upload;
