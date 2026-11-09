---
title: 'Markdown 排版指南'
summary: '展示当前主题支持的 Markdown 排版效果，包括提示块、高亮、剧透、折叠、图注、画廊与代码工具栏。'
pubDate: 2026-11-09
updatedDate: 2026-11-09
tags:
  - 'Markdown'
  - '写作'
---

这篇文章展示本站实际渲染的 Markdown 排版效果；写新文章时可以直接复制对应片段。

:::note[关于这份指南]
样式由站点统一维护；提示块、剧透、折叠等语法需要 `remark-directive` 支持，当前已经启用。
:::

## 文本格式

这是一段普通文本。**这是粗体文字**，_这是斜体文字_，_**这是粗斜体**_。你也可以使用 ~~删除线~~ 来标记废弃内容。

行内代码使用反引号包裹：`const hello = 'world'`，适合标记变量名或命令。

用 ==两个等号== 标出重点；两侧紧贴英文字母或数字时（如 `a==b`）不会变成高亮。

## 引用

> 设计的价值不止于建造完成。好的设计应该能够经受时间的考验，在岁月流转中依然保持其独特的魅力与实用性。

多段引用也可以写在同一个 blockquote 里：

> 第一段引用内容。
>
> 第二段引用内容，展示多段落效果。

来源标注可以放在引用最后：

> 设计的价值不止于建造完成。
>
> <cite>— Dieter Rams</cite>

### Pullquote

<blockquote class="pullquote">
  <p>你那么憎恨那些人，跟他们斗了那么久，最终却变得和他们一样。人世间没有任何理想值得以这样的沉沦为代价。</p>
  <cite>— 加西亚·马尔克斯《百年孤独》</cite>
</blockquote>

## 提示块（Callout）

支持 `note / tip / info / warning` 四种类型。最小写法：

```md
:::note[标题]
这是正文。
:::
```

:::note[无标题示例]
这是没有标题的提示块，适合放一段补充说明。
:::

:::tip[Tip]
可以包含行内代码 `npm run dev`、**强调文本**和 [链接](https://astro.build)。
:::

:::tip[自定义图标]{icon=✨}
标题右侧的图标也可以由语法糖指定。
:::

:::info[Info]
提示块里也可以放代码：

```ts
const hello = 'world';
```

:::

:::warning[Warning]

> 也可以包含引用块。
>
> 也可以换成多段内容。
> :::

需要更精细控制时，可以直接写 HTML；`data-icon="none"` 可以隐藏图标，`data-icon="✨"` 可以换图标：

<div class="callout note">
  <p class="callout-title" data-icon="none">无图标提示</p>
  <p>这是一段直接写 HTML 的提示块。</p>
</div>

## 高亮、模糊与折叠

行内模糊：故事的结局是 :spoiler[他一直都在原地等待]。点击文字后显示。

整段模糊：

:::spoiler
这一整段在点击前都是模糊的，适合藏起答案、彩蛋或剧情转折。
:::

折叠次要内容：

:::details[什么时候适合用折叠内容？]
常见问题、补充说明或较长的示例，都可以先收起来，让正文更好读。
:::

:::details[默认展开的折叠内容]{open}
在标题后加 `{open}`，页面打开时就是展开状态。
:::

写法汇总：

```md
==高亮文本==

:spoiler[行内模糊]

:::spoiler
整段模糊
:::

:::details[标题]{open}
折叠内容
:::
```

:::warning[注意]
模糊只用于防剧透，查看网页源码仍然能看到原文，不要用它存放密码等敏感信息。
:::

## 列表

### 无序列表

- 第一项
- 第二项
  - 嵌套项 A
  - 嵌套项 B
- 第三项

### 有序列表

1. 准备工作
2. 安装依赖
3. 运行项目
   1. 开发模式
   2. 生产构建

### 任务列表

- [x] 完成设计稿
- [x] 开发首页
- [ ] 编写文档
- [ ] 发布上线

## 代码块

带语言标记的代码块会显示语言、行号和复制按钮；工具栏由客户端渐进增强。

### JavaScript

```js
// 一个简单的 Astro 组件示例
const greeting = 'Hello, World!';

function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
```

### Python

```python
def quick_sort(arr):
    """快速排序算法实现"""
    if len(arr) <= 1:
        return arr

    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]

    return quick_sort(left) + middle + quick_sort(right)

numbers = [3, 6, 8, 10, 1, 2, 1]
print(quick_sort(numbers))
```

### CSS

```css
.card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border: 1px solid #171717;
  background: #fffdf8;
  box-shadow: 4px 4px 0 #bdbdb5;
}
```

### Shell

```bash
# 安装依赖并启动开发服务器
pnpm install
pnpm dev

# 构建生产版本
pnpm build
```

## 表格

| 功能       | 状态 | 说明               |
| ---------- | ---- | ------------------ |
| 响应式布局 | ✅   | 适配移动端         |
| 暗色模式   | ✅   | 跟随系统或手动切换 |
| RSS 订阅   | ✅   | 支持多 Feed        |
| 站内搜索   | ❌   | 计划中             |

## 链接与图片

这是一个 [外部链接](https://astro.build)，会在新标签页打开。

### Figure / Caption

<figure class="figure--md">
  <img src="/images/blog/2025/daily/travel/lingyanshan.jpg" alt="苏州灵岩山" loading="lazy" decoding="async" />
  <figcaption>图注示例：灵岩山的山脊与城市边缘。</figcaption>
</figure>

没有图注时，直接使用标准 Markdown 图片：

![苏州 · 灵岩山](/images/blog/2025/daily/travel/lingyanshan.jpg)

### Gallery

两图排版，可以带可选图注：

<ul class="gallery cols-2">
  <li>
    <figure>
      <img src="/images/blog/2025/daily/travel/lingyanshan.jpg" alt="灵岩山" loading="lazy" decoding="async" />
      <figcaption>灵岩山</figcaption>
    </figure>
  </li>
  <li>
    <figure>
      <img src="/images/blog/2025/daily/travel/haining.jpg" alt="海宁" loading="lazy" decoding="async" />
      <figcaption>海宁</figcaption>
    </figure>
  </li>
</ul>

点击任意图片可以打开大图预览，并在同一组图片之间左右切换。

## 分割线

上方是一些内容。

---

下方是另一些内容。

## 数学与特殊字符

当前不启用 KaTeX，数学符号可以直接写 Unicode：π ≈ 3.14159，e ≈ 2.71828。

特殊字符：© 2026 · ™ · ® · € · £ · ¥ · → · ← · ↑ · ↓

## 英文段落

> The best way to predict the future is to invent it. — Alan Kay

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

## 混合排版

这是一段包含 **粗体**、_斜体_、`代码`、==高亮== 和 [链接](/) 的混合排版文本，用来检查同一段落中的行内元素间距。

## Frontmatter 模板

新建文章时可以从这段模板开始：

```yaml
---
title: '文章标题'
summary: '一到两句话概括文章内容。'
pubDate: 2026-11-09
tags:
  - '随笔'
draft: false
# 可选：文章音乐，需要配置 PUBLIC_NETEASE_API_BASE
# music: https://music.163.com/song?id=...
---
```

写作时注意：

- 摘要里如果出现 `冒号+空格`，请用引号包住整段摘要，避免 YAML 解析失败。
- 发布后不要修改文件名，文章 URL 与评论线程都依赖它。
- 草稿（`draft: true`）不会出现在列表、RSS 和 sitemap 中。

---

以上就是当前主题支持的 Markdown 排版示例；如果新增语法，建议先在这里补一条用例。
