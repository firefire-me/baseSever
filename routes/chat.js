const express = require("express");
const { OpenAI } = require("openai");
const router = express.Router();

// 1. 初始化客户端：换成硅基流动的 API 地址
const client = new OpenAI({
  apiKey: "sk-ammgbzdccglgqvybgssxbtlvhswnfyoaccoiwapscnlpahlh", // 例如: sk-xxxxxxxxxx
  baseURL: "https://api.siliconflow.cn/v1", // 硅基流动的标准地址
});

router.post("/ask", async (req, res) => {
  try {
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "问题不能为空" });
    }

    // 2. 设置 HTTP 响应头，告诉前端这是一个“持续输出”的数据流
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    // 3. 调用硅基流动的模型，并开启 stream: true
    const stream = await client.chat.completions.create({
      model: "Qwen/Qwen2.5-7B-Instruct", // 推荐用这个免费且聪明的聊天模型
      messages: [
        { role: "system", content: "你是一个乐于助人的 AI 助手。" },
        { role: "user", content: question },
      ],
      stream: true, // 核心魔法：开启流式输出
    });

    // 4. 监听数据流，模型吐出一个字，我们就原封不动转给前端
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        res.write(content); // 把切片写入响应流
      }
    }

    // 5. 模型说话完毕，结束请求
    res.end();
  } catch (error) {
    console.error("AI 请求失败:", error);
    // 注意：如果已经开始 write 数据，就不能再发 status(500) 了
    if (!res.headersSent) {
      res.status(500).json({ error: "AI 思考时短路了，请稍后再试" });
    } else {
      res.end("\n[网络连接异常，对话中断]");
    }
  }
});

module.exports = router;
