const express = require('express');
const serverless = require('serverless-http');
const path = require('path');

// 导入你原有的 Express 应用
// 假设你的 Express 入口是 server/index.js，且导出了 app 对象
// 如果你的 server/index.js 没有导出 app，需要稍微改造一下
// const app = require('../server/index').app || require('../server/index');
const serverless = require('serverless-http');
const app = require('../server/index');
// 或者，你可以直接在 api/index.js 里重建 app（如果你不想改动原来的文件）
// 为避免重复代码，推荐前者

// 包装成 serverless handler
exports.handler = serverless(app);