declare const __MICRO_ENGINE__:
  "all" | "qiankun" | "micro-app" | "wujie" | "federation";
declare module "*.css";
declare module "appFederation/mount" {
  export function mount(
    container: HTMLElement,
    props: { basePath: string }
  ): () => void;
}
