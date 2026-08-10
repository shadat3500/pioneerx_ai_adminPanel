/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_SITE_URL: string;
  readonly VITE_PROXY_TARGET: string;
  readonly VITE_ALLOWED_HOSTS: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
