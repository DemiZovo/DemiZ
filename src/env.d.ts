/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly GITHUB_TOKEN?: string;
  readonly PUBLIC_DEPLOY_ENV?: 'production' | 'preview' | 'development';
  readonly PUBLIC_ANALYTICS_ENABLED?: 'true' | 'false';
  readonly PUBLIC_ANALYTICS_SITE_ID?: string;
  readonly PUBLIC_ANALYTICS_SCRIPT_URL?: string;
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
