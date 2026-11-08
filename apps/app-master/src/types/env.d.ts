declare const __MASTER_BASE_PATH__: string;
declare const __MICRO_ENTRIES__: Record<string, string>;
declare module "*.css";
declare module "appFederation/mount" {
  export function mount(
    container: HTMLElement,
    props: { basePath: string }
  ): () => void;
}
