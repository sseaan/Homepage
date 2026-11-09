/**
 * 友链。
 */
export interface FriendLink {
  name: string;
  url: string | null;
  note: string;
  /** 卡片左上角的短标记，默认取名称首字 */
  initial?: string;
  pending?: boolean;
}

export const friendLinks: FriendLink[] = [
  {
    name: 'L1nsn0w',
    url: 'https://sn0w.fyi/',
    note: '无限进步',
    initial: 'L',
  },
];
