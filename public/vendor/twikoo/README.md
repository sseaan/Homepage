# Twikoo 客户端（自托管）

- 版本：2.0.17
- 文件：`twikoo-2.0.17.all.min.js`（含云开发 SDK 与内联样式）
- 来源：https://www.npmjs.com/package/twikoo/v/2.0.17（`dist/twikoo.all.min.js`）
- 许可证：MIT，见 `LICENSE.txt`

只由文章页的评论区按需加载。升级步骤：换成新版本文件 → 同步修改
`src/config/site.ts` 的 `comments.scriptUrl` → 跑一遍 `.tk-*` 样式回归。
