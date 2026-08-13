export interface LocalProject {
  id: string;
  repo: `${string}/${string}`;
  name: string;
  description: string;
  homepage?: string;
  tags: string[];
  featured: boolean;
  hidden: boolean;
  order: number;
}

// 添加希望公开展示的仓库后，项目页会自动读取其 GitHub 数据。
export const projects: LocalProject[] = [];
