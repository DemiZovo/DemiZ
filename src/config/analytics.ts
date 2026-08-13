export type AnalyticsProvider = 'umami';

export interface AnalyticsConfig {
  enabled: boolean;
  provider: AnalyticsProvider;
  siteId: string;
  scriptUrl: string;
  showPublicCount: boolean;
}

/**
 * 统计功能的唯一配置入口。
 * GitHub Pages 正式发布工作流需设置 PUBLIC_DEPLOY_ENV=production；
 * 本地 build/preview 不应设置该变量。
 */
export const analyticsConfig = {
  enabled: import.meta.env.PUBLIC_ANALYTICS_ENABLED === 'true',
  provider: 'umami',
  siteId: import.meta.env.PUBLIC_ANALYTICS_SITE_ID ?? '',
  scriptUrl: import.meta.env.PUBLIC_ANALYTICS_SCRIPT_URL ?? '',
  showPublicCount: false,
} satisfies AnalyticsConfig;

