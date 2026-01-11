const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // 必填，且不能重复
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }, // 自动记录创建时间
});

module.exports = mongoose.model("User", UserSchema);
