/**
 * 友链。
 *
 * `avatar` 可选；加载失败时页面会回退到名称首字母占位。
 * 交换说明与失效说明放在数据文件里，About 页只负责渲染。
 */
export interface FriendLink {
  name: string;
  url: string | null;
  /** 站点头像 / 图标；留空时显示名称首字母 */
  avatar?: string;
  /** 头像加载失败时尝试的本地备用图（可选） */
  avatarFallback?: string;
  description: string;
  /** 头像缺失或加载失败时的短标记，默认取名称首字 */
  initial?: string;
  pending?: boolean;
}

/** 本站自己的友链信息，供交换友链时复制 */
export const myFriendLink = {
  name: 'Sseaan',
  url: 'https://www.ssean.cn',
  avatar: 'https://img.mvr.cc/cdn/PandaBot.png',
  avatarFallback: '/images/avatar.png',
  description: '山河见证长久，片刻亦能生辉。',
  initial: 'S',
} satisfies FriendLink;

export const friendLinks: FriendLink[] = [
  {
    name: 'L1nsn0w',
    url: 'https://sn0w.fyi/',
    avatar: 'https://sn0w.fyi/avatar.png',
    description: '无限进步',
    initial: 'L',
  },
  {
    name: '皓然',
    url: 'https://blog.horonlee.com',
    avatar: 'https://bu.dusays.com/2023/02/05/63dfc7f2ced91.png',
    description: '分享生活和技术的点滴',
  },
  {
    name: 'EastWind',
    url: 'https://blog.1wind.cn',
    avatar: 'https://wsrv.nl/?url=github.com/WindyDante.png',
    // github.com 头像在浏览器里会经历一次重定向，失败时直接使用最终头像地址
    avatarFallback: 'https://avatars.githubusercontent.com/u/125888129?v=4',
    description: '东风不与周郎便，铜雀春深锁二乔',
  },
  {
    name: '葱苓小筑',
    url: 'https://blog.ciraos.top',
    avatar: 'https://blog.ciraos.top/api/f/GlTn/1793077979925.avif',
    description: '风带来了故事的种子，时间使其发芽。',
  },
];

/** 「交换友链」默认展开的说明 */
export const friendExchangeSteps = [
  '先在你的站点添加本站友链，信息见「我的友链」卡片。',
  '把站点名称、链接、头像和一句简介发送到邮箱，或在 GitHub 仓库提 issue。',
  '我会人工访问确认后添加；不保证所有申请都会通过。',
];

/** 「失效与下架」默认折叠的说明 */
export const friendInvalidNotes = [
  '友链会定期检查：连续 30 天无法访问、域名过期或返回 404 的站点会被移除。',
  '站点长期停更、内容违规，或移除了本站链接，也可能下架。',
  '头像加载失败时会显示名称首字母占位，不影响友链本身。',
  '信息变更或恢复友链，请发邮件说明。',
];
