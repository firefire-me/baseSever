const express = require("express");
const router = express.Router(); // 1. 创建路由容器
const Task = require("../models/Task"); // 2. 引入刚才抽离的模型
const auth = require("../middleware/auth"); // 3. 引入认证中间件

// === Task 相关的 CRUD 接口 ===

// 1. 获取所有任务 (READ) - GET
router.get("/", auth, async (req, res) => {
  // find() 不加参数表示查找所有
  const tasks = await Task.find({ userId: req.user.id });
  res.json(tasks);
});

// 2. 创建新任务 (CREATE) - POST
// 注意：POST 请求通常会在请求体里包含新数据
router.post("/", auth, async (req, res) => {
  const { title } = req.body;
  const newTask = new Task({ title, userId: req.user.id });
  await newTask.save();
  res.status(201).json(newTask); // 201 Created
});

// 3. 更新任务状态 (UPDATE) - PUT
// 注意 ':id'，这叫做“路径参数” (Route Parameter)
// 前端请求示例: PUT /api/tasks/65a1b2c3d4...
router.put("/:id", auth, async (req, res) => {
  const { id } = req.params; // 获取 URL 里的 id
  const { isCompleted } = req.body; // 获取前端传来的新状态

  // findByIdAndUpdate: Mongoose 的快捷方法
  // { new: true } 表示返回更新后的数据，而不是更新前的
  const updatedTask = await Task.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { isCompleted },
    { new: true }
  );
  if (!updatedTask) {
    return res.status(404).json({ message: "任务不存在或无权操作" });
  }

  res.json(updatedTask);
});

// 4. 删除任务 (DELETE) - DELETE
router.delete("/:id", auth, async (req, res) => {
  const { id } = req.params;
  // 使用 findOneAndDelete 替代 findByIdAndDelete
  // 条件必须同时满足：1. ID匹配  2. 归属人匹配
  const deletedTask = await Task.findOneAndDelete({
    _id: id,
    userId: req.user.id,
  });
  if (!deletedTask) {
    // 如果找不到，可能是任务不存在，也可能是任务存在但不是你的
    return res.status(404).json({ message: "任务不存在或无权操作" });
  }
  res.json({ success: true, message: "删除成功" });
});

module.exports = router; // 3. 导出路由容器
