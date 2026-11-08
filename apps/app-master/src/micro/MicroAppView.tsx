import { useEffect, useRef, useState } from "react";
import { Alert, Button, Spin } from "antd";
import { loadEngine } from "./engines";
import type { MicroAppDefinition } from "./types";
import { createLifecycleManager } from "./lifecycle";

const lifecycle = createLifecycleManager(loadEngine);

export function MicroAppView({ app }: { app: MicroAppDefinition }) {
  const container = useRef<HTMLDivElement>(null);
  const [attempt, setAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    let disposed = false;
    setLoading(true);
    setError(undefined);
    const session = lifecycle.start({
      app,
      container: container.current!,
      basePath: `/apps/${app.name}`,
    });
    void session.ready.then(
      () => {
        if (!disposed) setLoading(false);
      },
      (reason: unknown) => {
        if (!disposed) {
          setLoading(false);
          setError(reason instanceof Error ? reason.message : "子应用加载失败");
        }
      }
    );
    return () => {
      disposed = true;
      void session
        .dispose()
        .catch((reason: unknown) => console.error("子应用卸载失败", reason));
    };
  }, [app, attempt]);

  return (
    <section aria-label={app.title}>
      {error && (
        <Alert
          type="error"
          showIcon
          title="子应用加载失败"
          description={error}
          action={
            <Button onClick={() => setAttempt((value) => value + 1)}>
              重试
            </Button>
          }
          className="mb-4"
        />
      )}
      <Spin spinning={loading} description="正在加载子应用…">
        <div ref={container} className="min-h-80" />
      </Spin>
    </section>
  );
}
