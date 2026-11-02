import type {
  EngineName,
  MicroAppHandle,
  MicroEngine,
  MountOptions,
} from "./types";

type Loader = (name: EngineName) => Promise<MicroEngine>;

// 一个页面展示区对应一个调度器：先完成旧实例的卸载，再允许下一实例挂载。
export function createLifecycleManager(load: Loader) {
  let queue: Promise<unknown> = Promise.resolve();
  const enqueue = (action: () => Promise<unknown>) => {
    const task = queue.then(action);
    // 单次失败不污染后续任务，调用方仍可从 task 获取本次异常。
    queue = task.catch(() => undefined);
    return task;
  };
  return {
    start(options: Omit<MountOptions, "signal">) {
      const controller = new AbortController();
      let handle: MicroAppHandle | undefined;
      let cleanup: Promise<unknown> | undefined;
      let resolveReady!: () => void;
      let rejectReady!: (reason: unknown) => void;
      const ready = new Promise<void>((resolve, reject) => {
        resolveReady = resolve;
        rejectReady = reject;
      });
      void enqueue(async () => {
        if (controller.signal.aborted) return;
        const engine = await load(options.app.engine);
        if (controller.signal.aborted) return;
        engine.initialize();
        handle = engine.mount({ ...options, signal: controller.signal });
        // 网络加载不占用调度队列，切走后可立即发出取消信号。
        void handle.ready.then(resolveReady, rejectReady);
      }).catch(rejectReady);
      return {
        ready,
        dispose() {
          if (cleanup) return cleanup;
          controller.abort();
          resolveReady();
          cleanup = enqueue(async () => {
            try {
              await handle?.dispose();
            } finally {
              options.container.replaceChildren();
            }
          });
          return cleanup;
        },
      };
    },
  };
}
