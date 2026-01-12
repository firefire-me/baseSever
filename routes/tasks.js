const express = require("express");
const router = express.Router(); // 1. 创建路由容器
const Task = require("../models/Task"); // 2. 引入刚才抽离的模型
const auth = require("../middleware/auth"); // 3. 引入认证中间件

// === Task 相关的 CRUD 接口 ===

// 1. 获取所有任务 (READ) - GET
router.get("/", async (req, res) => {
  try {
    // 1. 获取查询参数 (Query Params)
    // 也就是 URL 问号后面的东西：?page=1&limit=10&status=true&search=...
    const { page = 1, limit = 10, status, search, sort } = req.query;

    // 2. 构建查询条件 (Query Object)
    // 基础条件：必须是当前用户的任务
    const query = { userId: req.user.id };

    // 如果前端传了 status (比如 'true' 或 'false')
    if (status) {
      query.isCompleted = status === "true";
    }

    // 如果前端传了 search (模糊搜索标题)
    if (search) {
      // $regex 是 MongoDB 的正则匹配操作符
      // $options: 'i' 表示忽略大小写 (Case-insensitive)
      query.title = { $regex: search, $options: "i" };
    }

    // 3. 执行查询 (Mongoose 链式调用)
    const tasks = await Task.find(query)
      .sort(sort ? sort : "-createdAt") // 排序：默认按创建时间倒序(-代表倒序)
      .limit(Number(limit)) // 限制条数：一页多少条
      .skip((Number(page) - 1) * Number(limit)); // 跳过多少条：(页码-1)*每页条数

    // 4. 获取总数 (为了让前端知道一共有多少页)
    const total = await Task.countDocuments(query);

    // 5. 返回丰富的数据结构
    res.json({
      success: true,
      data: tasks,
      pagination: {
        total, // 总条数
        page: Number(page), // 当前页
        limit: Number(limit), // 每页条数
        totalPages: Math.ceil(total / limit), // 总页数
      },
    });
  } catch (error) {
    res.status(500).json({ message: "查询失败", error });
  }
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
