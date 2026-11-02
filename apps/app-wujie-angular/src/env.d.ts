declare module "*.css";
interface Window {
  __POWERED_BY_WUJIE__?: boolean;
  __WUJIE_MOUNT?: () => Promise<void>;
  __WUJIE_UNMOUNT?: () => void;
  $wujie?: { props: { basePath?: string } };
}

// Webpack 在构建时替换该常量。
declare const process: { env: { NODE_ENV: string } };
