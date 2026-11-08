import type { LogLevel, LogStore, LogStyle } from "./store";

export interface PageLogger {
  log(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  error(...args: unknown[]): void;
  step(...args: unknown[]): void;
  tag(...args: unknown[]): void;
  line(...args: unknown[]): void;
}

export const loggerScopes = {
  Logger: "Main",
  MainLogger: "Main",
  EventsLogger: "Events",
  SchedulerLogger: "Scheduler",
  RenderLogger: "Render",
  CommitLogger: "Commit",
  HooksLogger: "Hooks",
} as const;

export function installLogCapture(target: Window, store: LogStore) {
  let writing = false;
  function write(
    level: LogLevel,
    scope: string,
    args: unknown[],
    style: LogStyle = "log"
  ) {
    // 仅阶段日志写入页面，不拦截或调用原生 console。
    if (writing) return;
    writing = true;
    try {
      store.append(level, scope, args, style);
    } catch {
      /* 调试工具不能中断业务执行。 */
    } finally {
      writing = false;
    }
  }
  const previous = new Map<string, PropertyDescriptor | undefined>();
  for (const [name, scope] of Object.entries(loggerScopes)) {
    previous.set(name, Object.getOwnPropertyDescriptor(target, name));
    const logger: PageLogger = {
      log: (...args) => write("log", scope, args),
      info: (...args) => write("info", scope, args),
      debug: (...args) => write("debug", scope, args),
      warn: (...args) => write("warn", scope, args),
      error: (...args) => write("error", scope, args),
      step: (...args) => write("info", scope, args, "step"),
      tag: (...args) => write("info", scope, args, "tag"),
      line: (...args) => write("info", scope, args, "line"),
    };
    Object.defineProperty(target, name, {
      configurable: true,
      writable: true,
      value: logger,
    });
  }
  let disposed = false;
  return () => {
    if (disposed) return;
    disposed = true;
    for (const [name, descriptor] of previous) {
      if (descriptor) Object.defineProperty(target, name, descriptor);
      else Reflect.deleteProperty(target, name);
    }
  };
}
