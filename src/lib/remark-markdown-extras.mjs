/**
 * 站内 Markdown 扩展：
 *
 * :::note[标题] ... :::     提示块（note / tip / info / warning）
 * :::details[标题]{open}    折叠块
 * :::spoiler ... :::        整段剧透
 * :spoiler[文字]            行内剧透
 * ==文字==                  高亮
 *
 * 由 remark-directive 解析容器/行内指令，这里只负责转换成 HTML 节点；
 * 交互（显示剧透）由 MarkdownEnhance.astro 处理。
 */

const CALLOUTS = new Set(['note', 'tip', 'info', 'warning']);

const takeLabel = (node) => {
  const first = node.children?.[0];
  if (first?.type === 'paragraph' && first.data?.directiveLabel) {
    node.children.shift();
    return first.children ?? [];
  }
  return null;
};

const makeParagraph = (children, className, properties = {}) => ({
  type: 'paragraph',
  data: {
    hName: 'p',
    hProperties: { className: [className], ...properties },
  },
  children,
});

const makeSummary = (children) => ({
  type: 'paragraph',
  data: {
    hName: 'summary',
    hProperties: {},
  },
  children: children.length > 0 ? children : [{ type: 'text', value: '展开查看' }],
});

const transformDirectives = (node) => {
  if (!node.children) return;

  for (let index = 0; index < node.children.length; index += 1) {
    const child = node.children[index];

    if (child.type === 'containerDirective') {
      const label = takeLabel(child);

      if (CALLOUTS.has(child.name)) {
        const icon = child.attributes?.icon;
        child.data = {
          hName: 'div',
          hProperties: {
            className: ['callout', child.name],
          },
        };

        if (label) {
          child.children.unshift(
            makeParagraph(label, 'callout-title', icon ? { 'data-icon': icon } : {}),
          );
        }
      } else if (child.name === 'details') {
        child.data = {
          hName: 'details',
          hProperties: {},
        };
        if ('open' in (child.attributes ?? {})) {
          child.data.hProperties.open = true;
        }
        child.children.unshift(makeSummary(label ?? []));
      } else if (child.name === 'spoiler') {
        child.data = {
          hName: 'div',
          hProperties: {
            className: ['spoiler', 'spoiler--block'],
            'data-spoiler': '',
            tabIndex: 0,
            role: 'button',
            'aria-expanded': 'false',
            'aria-label': '显示隐藏内容',
          },
        };
      }
    }

    if (child.type === 'textDirective' && child.name === 'spoiler') {
      child.data = {
        hName: 'span',
        hProperties: {
          className: ['spoiler'],
          'data-spoiler': '',
          tabIndex: 0,
          role: 'button',
          'aria-expanded': 'false',
          'aria-label': '显示隐藏内容',
        },
      };
    }

    transformDirectives(child);
  }
};

const transformHighlights = (node) => {
  if (!node.children) return;

  const next = [];

  for (const child of node.children) {
    if (child.type !== 'text' || !child.value.includes('==')) {
      next.push(child);
      transformHighlights(child);
      continue;
    }

    const pattern = /==([^=\n]+?)==/g;
    let lastIndex = 0;
    let match;

    while ((match = pattern.exec(child.value))) {
      if (match.index > lastIndex) {
        next.push({ type: 'text', value: child.value.slice(lastIndex, match.index) });
      }

      next.push({
        type: 'emphasis',
        data: { hName: 'mark' },
        children: [{ type: 'text', value: match[1] }],
      });
      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < child.value.length) {
      next.push({ type: 'text', value: child.value.slice(lastIndex) });
    }
  }

  node.children = next;
};

export const remarkMarkdownExtras = () => (tree) => {
  transformDirectives(tree);
  transformHighlights(tree);
};
