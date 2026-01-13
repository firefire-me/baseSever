// routes/upload.js
const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); // 引入刚才写的配置
const auth = require("../middleware/auth"); // 引入认证中间件(如果有的话)

// POST /api/upload
// auth: 只有登录用户能传
// upload.single('file'): 接收一个名为 'file' 的文件
router.post("/", auth, upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "请选择文件" });
    }

    // 拼接完整的图片 URL 返回给前端
    // req.protocol + '://' + req.get('host') 会自动识别是 http 还是 https 以及域名
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${
      req.file.filename
    }`;

    res.json({
      success: true,
      message: "上传成功",
      url: fileUrl, // 前端拿到这个 url 就可以展示了
    });
  } catch (error) {
    res.status(500).json({ message: "上传失败", error: error.message });
  }
});

module.exports = router;
