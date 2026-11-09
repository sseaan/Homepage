# AGENT.md

本文件是 **Sseaan · 个人主页** 的工程规范，面向后续维护者和 AI coding agent。

优先级：**AGENT.md > README.md > 代码注释 > 历史草稿**。  
历史计划文件已移除；其中仍然有效的决策、约束和验收要求已合并到本文件。

## 1. 项目定位

一个以静态内容为主的个人主页，包含四个顶栏入口：

- Home：个人简介、项目、经历、兴趣、游戏
- Blog：Markdown 文章、目录、灯箱、分享卡片、评论
- Ech0：只读展示 `https://echo.ssean.cn` 的公开动态
- About：完整介绍、技术栈、友链

主站是 Astro SSG，不提供登录、CMS、数据库或 SSR API。Twikoo、Ech0 和 api-enhanced 都是浏览器端连接的外部服务；主站构建不依赖它们在线。

**这不是通用主题。** 站点信息、个人内容和视觉表达与作者绑定，不要为了“可复用”拆出与当前需求无关的抽象。

## 2. 不可协商的约束

- 使用 **Astro 7 + TypeScript strict + pnpm**；提交 `pnpm-lock.yaml`。
- Node 使用 **24.18.0**（CI / EdgeOne）；最低支持 22.23.4（Astro 7 要求）。
- 主站保持静态输出 `output: 'static'`，不引入 SSR、Edge Function、数据库或在线 CMS。
- 不引入 React/Vue/Svelte/Tailwind 等 UI 框架；交互使用原生 CSS + 渐进增强脚本。
- 不把密钥、Twikoo 管理凭据、API cookie 写入前端或 Git。`.env` 被忽略，只提交 `.env.example`。
- 不绕过 DOMPurify 直接插入 Ech0 Feed HTML。
- 不随意修改文章 slug；评论路径依赖稳定的 `/blog/<slug>`。
- Twikoo 客户端使用仓库内固定版本 `public/vendor/twikoo/twikoo-2.0.17.all.min.js`，不要改回第三方 CDN。
- 不把生产域名、社交链接、个人资料硬编码进组件；统一放 `src/config/site.ts` 或 `src/data`。
- 新增视觉样式必须使用 `src/styles/tokens.css` / `themes.css` 的令牌，不在组件里硬编码主题色。
- 不自动播放音乐；音频接口失败、VIP 或无音源时必须优雅降级；全局播放器默认只显示入口按钮，点击后才请求歌单。首次加载不自动播放，但用户已在播放时跨页必须继续。
- 跨页连续播放依赖 `ClientRouter` + `transition:persist="site-music-player"`；不要移除持久化音乐根节点，也不要在导航后重建 `<audio>`。
- 所有交互控件必须有键盘焦点、可访问名称和适当的 `aria-*`；尊重 `prefers-reduced-motion`。

## 3. 环境与命令

### 环境

- Node.js **24.18.0**（推荐；见 `.nvmrc`；最低 22.23.4）
- pnpm **12.18.0**（见 `packageManager`）
- 本机若同时装有 Node 26，`pnpm check` 可能因 WASM 运行时崩溃；使用 Node 24.18.0。

### 常用命令

```bash
pnpm install
pnpm dev            # http://localhost:4321
pnpm format         # Prettier 写入
pnpm format:check   # CI 检查
pnpm check          # astro check
pnpm test           # Vitest
pnpm build          # 输出 dist/
pnpm preview        # 预览 dist/
pnpm mock:twikoo    # 本地评论 mock，端口 4323
```

### 完成定义

功能改动至少满足：

```bash
pnpm format:check
pnpm test
pnpm check
pnpm build
```

涉及 UI 时再做浏览器验收：桌面/移动端、浅色/深色/自动、键盘焦点、减少动效、空/错/加载状态。不要把“能构建”当作“已完成”。

## 4. 架构与职责

```text
src/
├── components/
│   ├── site/       Header、Footer、PageNav、Avatar、PageHeader
│   ├── home/       首页区块与行式列表
│   ├── blog/       文章元信息、目录、分享、分享卡片、Markdown 增强
│   ├── music/      全站歌单面板与文章封面播放器
│   ├── media/      全站共享 Lightbox
│   ├── comments/   Twikoo 评论区
│   ├── ech0/       Ech0 Feed 渲染
│   ├── icons/      Icon.astro 与本地 SVG 路径
│   ├── doodles/    手绘装饰
│   ├── splash/     点阵开屏
│   └── theme/      三态主题初始化与控制
├── config/site.ts  站点级配置：信息、导航、社交、页脚、Ech0、Twikoo
├── data/           home.ts / about.ts / friends.ts（友链与交换说明）可编辑内容
├── content/blog/   Markdown 文章与图片引用
├── layouts/        BaseLayout、BlogLayout
├── pages/          /、/about、/ech0、/blog、/blog/[...slug]、/rss.xml、/404
├── lib/            ech0.ts、netease.ts、netease-player.ts、remark-markdown-extras.mjs
├── styles/         tokens、themes、global、music、prose-extras、comments、ech0、lightbox、doodles
└── content.config.ts
```

职责规则：

- `src/config/site.ts`：站点身份、导航、社交、页脚、备案、Ech0、Twikoo、全站歌单。
- `src/data/`：首页、About、友链的文字内容；不要把个人经历写进组件。友链头像、本站友链信息和交换/失效说明统一放 `friends.ts`。
- `src/content/blog/`：文章正文与 frontmatter；图片使用 S3/CDN 完整 URL，不放本地 `public/images/blog/`。
- `src/lib/`：可测试的纯逻辑与独立客户端控制器；不要放 JSX/样式。
- `src/components/`：展示与局部交互；跨页面复用的基础组件放 `site/`、`media/`、`icons/`。
- `src/layouts/`：页面骨架和跨页面组合；不要在这里写文章内容。
- `src/styles/`：设计令牌与全局/领域样式；组件 scoped 样式只处理局部布局。`music.css` 必须保持全局样式，因为曲目/歌词节点由客户端动态生成。

## 5. 内容规范

### 文章 frontmatter

```yaml
---
title: 文章标题
summary: 一到两句话概括文章内容。
pubDate: 2026-11-08
updatedDate: 2026-11-10 # 可选
tags:
  - 随笔
draft: false
music: https://music.163.com/song?id=... # 可选，歌曲或歌单
---
```

- `title`、`summary`、`pubDate` 必填；schema 失败必须让构建失败，不能静默忽略。
- `summary` 是纯文本，只用于列表、页头摘要和 RSS description，不按 Markdown/HTML 渲染。
- 摘要包含 **冒号+空格** 时必须用引号包住：`summary: "包含 draft: true 的说明"`。
- `draft: true` 不生成页面，不进入列表、RSS、sitemap。
- 文章 URL 固定为 `/blog/<文件名>`；改名会破坏评论线程和外部链接。
- `music` 只在配置了 `PUBLIC_NETEASE_API_BASE` 时生效，见第 7 节；单曲支持纯数字 ID，歌单需使用歌单链接或 `playlist:<id>` 前缀。
- `markdown-guide.md` 是长期保留的排版示例草稿（`draft: true`）：文件留在仓库，但不进入列表、RSS、sitemap 和线上页面。其他临时验收文章仍应在验收后删除。

### Markdown 扩展

`astro.config.mjs` 使用 `@astrojs/markdown-remark` 的 `unified()` processor，注册：

- `remark-directive`：`:::note` / `:::tip` / `:::info` / `:::warning`、`:::details`、`:::spoiler`、`:spoiler[...]`
- `src/lib/remark-markdown-extras.mjs`：转换为 `div.callout`、`details`、`span.spoiler`、`mark`

客户端增强在 `src/components/blog/MarkdownEnhance.astro`：

- 代码块加语言、行数、行号、复制按钮
- 剧透点击/Enter/空格显示
- 外部 `http(s)` 链接加 `target="_blank"` 与 `rel="noopener noreferrer"`

样式在 `src/styles/prose-extras.css`。新增 Markdown 语法时必须同时补：转换器、样式、客户端行为（如需要）、`markdown-guide.md` 示例和测试。

### 友链

- `src/data/friends.ts` 维护 `friendLinks`、`myFriendLink`、交换步骤和失效说明；About 页只负责渲染。
- `avatar` 可选；缺失或加载失败时回退到 `initial` / 名称首字，图片必须使用可公开访问的 HTTPS 地址。可选的 `avatarFallback` 用于远程头像失败时先换用备用图（例如本站 `/images/avatar.png` 或 GitHub 最终头像地址），仍失败再显示首字母。
- 「交换友链」默认展开，「友链失效与下架」默认折叠；修改结构时保留 `<details>` 的原生键盘行为。
- 外链统一 `target="_blank" rel="noopener noreferrer"`；头像 `alt` 置空，名称已经提供可访问文本。

### 图片

- Blog 图片托管在 S3 / CDN：`https://img.mvr.cc/blog/<Post>/...`；Markdown 使用完整 HTTPS URL，不依赖本地 `public/images/blog/` 路径。
- 新增或迁移图片时确认 CDN 路径大小写和扩展名（例如 `Yubikey`、`2025Summary`）；不要假设与本地目录完全一致。
- 本地文章图片目录已移除，S3/CDN 是唯一源；删除文章时同步清理 S3 对象。
- 正文图片自动进入共享灯箱；画廊使用同组容器，灯箱内左右切换。
- 分享卡片复用正文首图；同源或返回 CORS 头的 CDN 图片才可进入 Canvas，否则降级为不含图片的卡片。
- 新增图片要确认授权与体积；删除文章时同步清理其未引用图片。

## 6. 视觉规范

- 基底：纯白 / 近黑背景，中性灰阶；强调色只使用 `--doodle-accent`（当前为暖橙）。
- 排版：全站容器 60rem；普通文章正文 40rem；带目录时 40rem + 12rem。
- 形状：1.5–2px 粗边、2px 直角圆角、无模糊硬阴影；不要堆叠卡片和阴影。
- 字体：系统无衬线为正文；首页名字使用自托管 Great Vibes（SIL OFL）；不请求第三方字体服务。
- 手绘只做少量批注：Home 名字/头像箭头、文章返回箭头、Blog/About/Ech0 页头、404 箭头、圈选/星号。不要每个标题都加装饰。
- 游戏条目装饰统一使用 `// 游戏名` 与 `+ + +`：绝区零为橙色 `#d9662f`，胡闹厨房为番茄红 `#b23b2e`；不要改图标或背景。
- 分享栏固定 X / 邮件 / 分享卡片 / 复制链接，不增加 Facebook、微博、Telegram。
- 分享卡片为 Canvas 生成，宽 1080px，高度随标题/摘要动态计算；顶部品牌/日期同一中心线，图片收在页边距内。
- 主题顺序固定为 **自动 → 白天 → 黑夜**；首屏 ThemeInit 防闪烁；无 JS 跟随系统。
- 开屏点阵约 1 秒，同一会话只播放一次；`prefers-reduced-motion: reduce` 时跳过。

## 7. 客户端服务

### Ech0

- 页面加载时浏览器直接读取 `src/config/site.ts` 的 `feedUrl`；构建不依赖 Ech0。
- 请求使用 `credentials: 'omit'`、超时和重试；失败显示原站入口。
- HTML 必须先经 `src/lib/ech0.ts` 的 DOMPurify 白名单清洗；内部 http 升级为 https；图片懒加载、失败移除但保留正文。
- 图片布局：1 张单图、2–4 张轮播、5+ 张宫格；超过 9 张的第 9 格链接原站。
- 不要关闭浏览器安全策略来绕过 CORS；改为服务端代理或接受失败态。
- 修改解析/清洗逻辑时更新 `tests/ech0.test.ts` 与 `tests/fixtures/`。

### Twikoo

- 客户端固定版本自托管在 `public/vendor/twikoo/`；不要使用 CDN。
- 只在文章详情页渲染；距视口 400px 内懒加载。
- 评论 path 为 `/blog/<slug>`；不要改 slug。
- 独立处理未配置、加载、空、失败、超时、内部错误；失败不能影响正文。
- 样式用 `.comments-shell .twikoo` 前缀隔离，不 fork 上游、不写全局 `.tk-*`。
- 后端部署细节见 README；本地用 `pnpm mock:twikoo`，mock 只用于开发。
- 不在仓库保存 Twikoo 管理凭据；评论数据备份在管理面板处理。

### api-enhanced 音乐播放器

- 全局歌单在 `src/config/site.ts` 的 `music.playlist`（网易云歌单链接或纯数字 ID）；null 时不渲染。
- 全站只在浏览页面右下角显示「听歌」入口；点击后展开面板，收起后继续播放；未打开前不请求 API。面板含封面、曲目列表、随机、上一首/播放/下一首、音量、进度条和歌词。
- 文章有 `music` 时隐藏全站入口，替换为文章自己的单曲/歌单，默认显示现有右下角封面按钮；歌单按顺序自动续播。
- 页面上下文通过 `<body data-page-music="...">` 传给持久播放器；音乐根节点带 `transition:persist`，ClientRouter 导航时同一个 `<audio>` 元素被保留，因此跨页不中断。
- 音乐根节点内的两种 UI（全局面板 + 文章封面）同时在 DOM 中，由 `data-mode` 切换；不要按页面条件决定是否渲染，否则持久化会失效。
- 歌单/歌曲信息缓存到 `localStorage` 24 小时，歌词缓存 7 天；缓存键以 `site-music:` 开头。不要在未播放时预取 `/song/url`。
- 解析：`src/lib/netease.ts` 的 `parseNeteaseMusicSource` / `parseNeteaseLyrics`；纯数字默认单曲，歌单使用歌单链接或 `playlist:<id>`。
- 接口：单曲 `/song/detail?ids=`，歌单 `/playlist/detail?id=` + `/playlist/track/all`，歌词 `/lyric?id=`；音频 `/song/url/v1?id=&level=exhigh`，失败回退 `standard` 和旧 `/song/url`。
- 客户端逻辑在 `src/lib/netease-player.ts`，组件在 `src/components/music/MusicPlayer.astro`；动态生成的曲目/歌词样式在 `src/styles/music.css`，不要改成 scoped。
- HTTPS 站点要求 API 也是 HTTPS；CORS 由 api-enhanced 的 `CORS_ALLOW_ORIGIN` 配置。
- 不硬编码歌曲、不自动播放、不下载音频；只播放有授权的音乐。加载失败、VIP、无音源和音频错误都要有可见状态。

### ClientRouter 与页面脚本

- `BaseLayout` 启用 Astro `ClientRouter`；所有页面级脚本必须在 `astro:page-load` 后重新初始化，或使用 `data-*-ready` 等幂等守卫。
- 全局监听器（主题、灯箱、音乐）只绑定一次；页面级监听器在 `astro:before-swap` 清理，避免跨页重复。
- 新增交互组件时至少验证：直接访问、从其它页面客户端跳转进入、返回上一页、浏览器前进/后退。
- 不要把页面专属状态（文章 ID、评论 path、当前音乐）写进持久化根节点；通过新的 `<body>` 属性或当前 DOM 读取。

### 分享卡片

- `src/components/blog/ArticleShare.astro` 内生成；无第三方截图库。
- 1080px 宽；高度根据标题/摘要/有无图片动态决定。
- 包含标题、摘要、正文首图（同源）、日期、站点地址；下载文件名为文章 slug。
- 修改布局时检查：品牌方块/文字/日期中心线、图片不越过页边距、短摘要不产生大片空白。
- 关闭后焦点回到触发按钮；移动端支持长按保存。

## 8. 环境变量与部署

| 变量                      | 作用                                      | 注意                                                        |
| ------------------------- | ----------------------------------------- | ----------------------------------------------------------- |
| `SITE_URL`                | canonical / OG / RSS / sitemap 的绝对地址 | 生产建议显式设置，例如 `https://www.ssean.cn`，末尾不要 `/` |
| `PUBLIC_TWIKOO_ENV_ID`    | 覆盖 Twikoo 后端根地址                    | 公开地址；默认在 `src/config/site.ts`                       |
| `PUBLIC_NETEASE_API_BASE` | api-enhanced 根地址                       | 公开地址；HTTPS 站点必须 HTTPS；不配置则不渲染播放器        |

- 部署：EdgeOne Makers，Astro preset，`pnpm install --frozen-lockfile`，构建 `pnpm build`，输出 `dist`，Node `24.18.0`。EdgeOne 的 22.11 / 22.17 / 22.21 低于 Astro 7 的 22.23.4 最低要求，不要选择。
- 主站和 Twikoo 后端分开部署；主站 push 不会更新评论后端。
- CI 在 `.github/workflows/ci.yml`，执行格式检查、`astro check`、Vitest 和构建。
- `SITE_URL` 未设置时使用 `astro.config.mjs` 的默认域名；不要在其他文件重复硬编码域名。

## 9. 验收清单

### 代码与构建

- [ ] `pnpm format:check`
- [ ] `pnpm test`
- [ ] `pnpm check`（0 error / 0 warning）
- [ ] `pnpm build`
- [ ] 新增纯逻辑有 Vitest 覆盖
- [ ] 未引入不必要依赖、未提交生成物或密钥

### 页面与内容

- [ ] `/`、`/about`、`/blog`、`/ech0`、文章详情、`/rss.xml`、`/404` 可访问
- [ ] 移动端无横向溢出；文章正文 40rem，分享栏右边与正文对齐
- [ ] 浅色 / 深色 / 自动三态可切换；无 JS 时不崩
- [ ] 键盘可访问；图片有 alt；图标按钮有 aria-label
- [ ] `prefers-reduced-motion` 下开屏与动画降级
- [ ] 友链头像加载失败回退首字母；交换说明默认展开，失效说明默认折叠
- [ ] 草稿不进入列表、RSS、sitemap
- [ ] 文章 frontmatter 错误会让构建失败
- [ ] RSS 与 sitemap 包含当前公开文章

### 集成

- [ ] Ech0 空/错/成功状态正常；恶意 HTML 被清洗
- [ ] Twikoo 失败不影响正文；主题切换不丢草稿
- [ ] 音乐无配置时不请求；全站入口默认折叠；VIP/无音源/歌单加载失败有提示
- [ ] 随机、音量、歌词可用；已播放状态下跨页音乐继续，歌单信息命中缓存
- [ ] ClientRouter 导航后主题、灯箱、评论、Ech0、TOC、分享卡片仍可用
- [ ] 有 `music` 的文章不显示全站入口，文章播放器默认可见且不自动播放；歌单自动续播
- [ ] 分享卡片图片不溢出、顶部对齐、短摘要高度紧凑

## 10. 修改与清理规则

- 优先修改现有组件和数据文件，不为单次需求引入新框架。
- 改动行为、配置或结构时同步更新 README；改动工程约束时同步更新 AGENT.md。
- 新增依赖前确认：是否可用原生 API、是否影响静态构建、是否增加客户端体积。
- 不保留一次性测试文章、临时截图、`.DS_Store`、`dist/`、`.astro/` 或调试日志进仓库。
- 历史计划文件已删除，不要重新创建重复的计划文件；路线图和决策记录写入本文件或 README。
- 清理图片前先全局搜索引用；删除文章时同步删除其独占图片。
- 不修改 `public/vendor/twikoo/` 内第三方文件，除非升级版本并做回归。
- 任何“临时”改动都要在交付前移除，或在 AGENT.md 明确记录为长期决策。

## 11. 关键决策与坑

| 项       | 决策                                                                                                        |
| -------- | ----------------------------------------------------------------------------------------------------------- |
| 框架     | Astro 7，而不是早期计划中的 Astro 5；内容集合、`render()`、`glob()` 按 v7 写                                |
| Node     | 24.18.0（EdgeOne / CI）；22.23.4 为最低要求；Node 26 下 `pnpm check` 的 WASM 可能崩溃                       |
| pnpm     | `pnpm-workspace.yaml` 固定 `@napi-rs/wasm-runtime@1.2.7`、`@emnapi/runtime@1.11.3`，避免 check 崩溃         |
| Markdown | 使用 unified + remark-directive；不要直接切回 Sätteri 默认处理器而不迁移插件                                |
| 文章宽度 | 无目录页面也保持 40rem，避免分享栏/页头被拉到 60rem                                                         |
| 分享栏   | 仅 X、邮件、分享卡片、复制链接                                                                              |
| 分享卡片 | 1080px 宽，动态高度，图片内缩，顶部中心线对齐                                                               |
| 音乐     | api-enhanced 可选；全局歌单入口默认折叠，文章 music 覆盖歌单并默认显示封面；ClientRouter + persist 跨页延续 |
| 跨页脚本 | ClientRouter 下脚本只执行一次；页面级初始化统一挂 `astro:page-load`，全局监听器只绑定一次                   |
| Twikoo   | 固定客户端版本，自托管，懒加载；不改评论 path                                                               |
| Ech0     | 客户端读取 + DOMPurify；构建不依赖线上 Feed                                                                 |
| 字体     | Great Vibes 自托管，SIL OFL；正文不回退到远程字体                                                           |
| 游戏装饰 | 绝区零橙色 / 胡闹厨房番茄红，统一 `// 名称` + `+ + +`，不改图标/背景                                        |
| 域名     | 正式站点固定 `https://www.ssean.cn`；Canonical / RSS / sitemap 都使用 www                                   |
| 历史计划 | 已移除；本文件是唯一工程规范，README 是使用说明                                                             |

## 12. 当前状态

- 阶段 0–5 已完成：工程、视觉、博客、Twikoo、Ech0、内容填充。
- 博客已包含灯箱、分享卡片、Markdown 扩展、api-enhanced 全站歌单与文章音乐播放器（随机 / 音量 / 歌词 / 跨页连续播放 / 缓存）。
- `markdown-guide.md` 作为长期保留的 Markdown 排版示例草稿，保持 `draft: true`，不公开发布。
- 阶段 6 仍需在正式域名下完成 CORS/评论回归、CI 门禁、备份策略和桌面/移动端/无障碍/三主题全量验收。
- 站点使用 EdgeOne Makers 部署；Twikoo 后端独立维护。
