const express = require("express");
const serverless = require("serverless-http");
const path = require("path");

// 导入你原有的 Express 应用
// 假设你的 Express 入口是 server/index.js，且导出了 app 对象
// 如果你的 server/index.js 没有导出 app，需要稍微改造一下
// const app = require('../server/index').app || require('../server/index');
import serverless from "serverless-http";
import app from "../server/index.js"; // 必须加 .js 扩展名

export const handler = serverless(app);

router.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});
