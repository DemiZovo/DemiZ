import { projects, type LocalProject } from '../config/projects';

export interface GitHubProjectData {
  stars: number;
  forks: number;
  language: string | null;
  updatedAt: string;
  url: string;
}

export type Project = LocalProject & { github: GitHubProjectData | null };

async function fetchGitHub(repo: string): Promise<GitHubProjectData | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${repo}`, {
      signal: AbortSignal.timeout(5000),
      headers: {
        Accept: 'application/vnd.github+json',
        ...(import.meta.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}` }
          : {}),
      },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      language: data.language,
      updatedAt: data.updated_at,
      url: data.html_url,
    };
  } catch {
    return null;
  }
}

/** GitHub 不可用时保留本地数据，不能让构建失败。 */
export async function getProjects(): Promise<Project[]> {
  const visible = projects.filter((project) => !project.hidden).sort((a, b) => a.order - b.order);
  return Promise.all(visible.map(async (project) => ({ ...project, github: await fetchGitHub(project.repo) })));
}
