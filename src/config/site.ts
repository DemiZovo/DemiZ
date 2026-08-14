export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  author: { name: string; bio: string; github: string; email: string; leetcode: string };
  locale: string;
  postsPerPage: number;
}

export const siteConfig = {
  name: 'DemiZ',
  description: 'DemiZ 的代码学习与生活记录。',
  url: 'https://demizovo.github.io/DemiZ',
  author: {
    name: 'DemiZ',
    bio: '',
    github: 'https://github.com/DemiZovo',
    email: 'DemiZovo@163.com',
    leetcode:'https://leetcode.cn/u/demiz-ovo/'
  },
  locale: 'zh-CN',
  postsPerPage: 10,
} satisfies SiteConfig;
