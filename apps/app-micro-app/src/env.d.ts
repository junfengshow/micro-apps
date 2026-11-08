declare module "*.module.css" {
  const styles: Record<string, string>;
  export default styles;
}
interface Window {
  __POWERED_BY_QIANKUN__?: boolean;
  __INJECTED_PUBLIC_PATH_BY_QIANKUN__?: string;
  __MICRO_APP_ENVIRONMENT__?: boolean;
  __MICRO_APP_PUBLIC_PATH__?: string;
  microApp?: { getData(): { basePath?: string } | undefined };
  mount?: () => void;
  unmount?: () => void;
  __POWERED_BY_WUJIE__?: boolean;
  __WUJIE_MOUNT?: () => void;
  __WUJIE_UNMOUNT?: () => void;
  $wujie?: { props: { basePath?: string } };
}
declare let __webpack_public_path__: string;
