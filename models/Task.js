const mongoose = require("mongoose");

// 新增：任务模型
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true }, // 任务标题
  isCompleted: { type: Boolean, default: false }, // 是否完成，默认 false
  userId: {
    type: mongoose.Schema.Types.ObjectId, // MongoDB 专用的 ID 类型
    ref: "User", // 指向 User 模型 (为了以后做关联查询用)
    required: true, // 必须有归属人，不能创建“无主”任务
  },
});

module.exports = mongoose.model("Task", TaskSchema);
