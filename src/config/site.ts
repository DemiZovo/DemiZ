export interface SiteConfig {
  name: string;
  description: string;
  url: string;
  author: { name: string; bio: string; github: string; email: string };
  locale: string;
  postsPerPage: number;
}

export const siteConfig = {
  name: 'DemiZovo',
  description: 'DemiZ 的代码学习与生活记录。',
  url: 'https://demizovo.github.io/My-website',
  author: {
    name: 'DemiZ',
    bio: '',
    github: 'https://github.com/DemiZovo',
    email: 'DemiZovo@163.com',
  },
  locale: 'zh-CN',
  postsPerPage: 10,
} satisfies SiteConfig;
