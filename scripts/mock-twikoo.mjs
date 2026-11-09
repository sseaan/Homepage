/**
 * 本地 Twikoo 2.0 HTTP 后端 mock，只用于开发/视觉验收，不参与构建或部署。
 *
 * 用法：
 *   node scripts/mock-twikoo.mjs            # 默认 http://127.0.0.1:4323
 *   PUBLIC_TWIKOO_ENV_ID=http://127.0.0.1:4323 pnpm build && pnpm preview
 *
 * 行为：
 * - /blog/markdown-guide 返回 3 条评论（含楼中楼、代码、引用、链接）
 * - /blog/canokey 返回空列表，用于验证空状态
 * - COMMENT_SUBMIT 返回成功 id，随后客户端会重新拉取列表
 */
import http from 'node:http';

const PORT = Number(process.env.PORT ?? 4323);
const now = Date.now();

const comments = [
  {
    id: 'mock-1',
    url: '/blog/markdown-guide',
    nick: 'Sseaan',
    master: true,
    comment: '<p>这是站长的示例评论，用来检查博主标签、头像占位和楼中楼样式。</p>',
    created: now - 1000 * 60 * 60 * 6,
    updated: now - 1000 * 60 * 60 * 6,
    ups: 2,
    downs: 0,
    ipRegion: '广东',
    os: 'macOS',
    browser: 'Chrome',
    replies: [
      {
        id: 'mock-1-r1',
        url: '/blog/markdown-guide',
        nick: '访客 A',
        pid: 'mock-1',
        rid: 'mock-1',
        ruser: 'Sseaan',
        comment: '<p>回复测试：楼中楼会缩进，并用左侧细线表示层级。</p>',
        created: now - 1000 * 60 * 60 * 4,
        ups: 0,
        downs: 0,
        replies: [],
      },
    ],
  },
  {
    id: 'mock-2',
    url: '/blog/markdown-guide',
    nick: '访客 B',
    link: 'https://example.com',
    comment:
      '<p>带 <a href="https://example.com" target="_blank" rel="nofollow">链接</a>、<code>inline code</code> 和引用的评论：</p><blockquote>引用内容应该和正文有明显区分，但不抢眼。</blockquote><ul><li>列表项一</li><li>列表项二</li></ul>',
    created: now - 1000 * 60 * 60 * 3,
    ups: 1,
    downs: 0,
    ipRegion: '上海',
    replies: [],
  },
  {
    id: 'mock-3',
    url: '/blog/markdown-guide',
    nick: '访客 C',
    comment:
      '<p>代码块和长链接测试：</p><pre><code>const answer = 42;\nconsole.log(answer);</code></pre><p>https://example.com/a/very/long/url/that/should/wrap/instead/of/overflowing/the/comment/container</p>',
    created: now - 1000 * 60 * 60,
    ups: 0,
    downs: 0,
    ipRegion: '北京',
    replies: [],
  },
];

const config = {
  VERSION: '2.0.17',
  MASTER: 'Sseaan',
  MASTER_TAG: '博主',
  REQUIRED_FIELDS: ['nick', 'mail'],
  SHOW_ORDER: 'true',
  SHOW_DISLIKE: 'true',
  SHOW_EMOTION: 'false',
  SHOW_IMAGE: 'false',
  SHOW_REGION: 'true',
  SHOW_UA: 'false',
  LIMIT: '10',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(204).end();
    return;
  }

  if (req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Twikoo mock server is running');
    return;
  }

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });
  req.on('end', () => {
    let payload = {};
    try {
      payload = JSON.parse(body || '{}');
    } catch {
      res.writeHead(400).end('bad json');
      return;
    }

    const { event, url = '' } = payload;
    let result;

    if (event === 'GET_CONFIG') {
      result = { code: 0, config };
    } else if (event === 'COMMENT_GET') {
      if (url.includes('canokey')) {
        result = { code: 0, data: [], more: false, count: 0 };
      } else {
        result = { code: 0, data: comments, more: false, count: comments.length };
      }
    } else if (event === 'COMMENT_SUBMIT') {
      result = { code: 0, id: `mock-${Date.now()}` };
    } else if (event === 'GET_FUNC_VERSION') {
      result = { code: 0, version: '2.0.17' };
    } else if (event === 'GET_VISITORS' || event === 'UPDATE_VISITORS') {
      result = { code: 0, time: 1 };
    } else {
      result = { code: 0 };
    }

    console.log(`[mock-twikoo] ${event ?? 'unknown'} ${url}`.trim());
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(result));
  });
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[mock-twikoo] http://127.0.0.1:${PORT}`);
});
