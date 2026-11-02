import { test } from "node:test";
import assert from "node:assert/strict";
import { createLifecycleManager } from "../src/micro/lifecycle";
import type { MicroEngine, MountOptions } from "../src/micro/types";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
function options(name: string): Omit<MountOptions, "signal"> {
  return {
    app: { name, title: name, entry: "/", engine: "qiankun" },
    basePath: "/",
    container: { replaceChildren() {} } as unknown as HTMLElement,
  };
}
test("加载期间切走：迟到的引擎不能再挂载，销毁幂等", async () => {
  const loading = deferred<MicroEngine>();
  let mounts = 0;
  const manager = createLifecycleManager(() => loading.promise);
  const session = manager.start(options("a"));
  await Promise.resolve();
  const cleanup = session.dispose();
  assert.equal(session.dispose(), cleanup);
  loading.resolve({
    initialize() {},
    mount() {
      mounts++;
      return { ready: Promise.resolve(), dispose: async () => {} };
    },
  });
  await cleanup;
  await session.ready;
  assert.equal(mounts, 0);
});
test("切换引擎：必须等待前一个应用完成卸载", async () => {
  const unloading = deferred<void>();
  const disposeStarted = deferred<void>();
  const calls: string[] = [];
  const manager = createLifecycleManager(async () => ({
    initialize() {},
    mount({ app, signal }) {
      calls.push(`mount:${app.name}`);
      return {
        ready: Promise.resolve(),
        async dispose() {
          assert.equal(signal.aborted, true);
          calls.push(`dispose:${app.name}`);
          disposeStarted.resolve();
          if (app.name === "a") await unloading.promise;
        },
      };
    },
  }));
  const first = manager.start(options("a"));
  await first.ready;
  const cleanup = first.dispose();
  const second = manager.start(options("b"));
  await disposeStarted.promise;
  assert.deepEqual(calls, ["mount:a", "dispose:a"]);
  unloading.resolve();
  await cleanup;
  await second.ready;
  assert.deepEqual(calls, ["mount:a", "dispose:a", "mount:b"]);
  await second.dispose();
});
test("挂载失败后仍可以切换到其他应用", async () => {
  const manager = createLifecycleManager(async () => ({
    initialize() {},
    mount({ app }) {
      if (app.name === "bad") throw new Error("加载失败");
      return { ready: Promise.resolve(), dispose: async () => {} };
    },
  }));
  const bad = manager.start(options("bad"));
  await assert.rejects(bad.ready, /加载失败/);
  await bad.dispose();
  const good = manager.start(options("good"));
  await good.ready;
  await good.dispose();
});
