import { snapshotArguments, type ValueSnapshot } from "./snapshot";

export const logLevels = ["log", "info", "debug", "warn", "error"] as const;
export type LogLevel = (typeof logLevels)[number];
export type LogStyle = "log" | "step" | "tag" | "line";
export interface LogEntry {
  id: number;
  level: LogLevel;
  scope: string;
  style: LogStyle;
  values: ValueSnapshot[];
}

export function createLogStore(limit = 300) {
  const entries: LogEntry[] = [];
  let nextId = 0;
  const listeners = new Set<() => void>();
  return {
    get entries(): readonly LogEntry[] {
      return entries;
    },
    append(
      level: LogLevel,
      scope: string,
      args: readonly unknown[],
      style: LogStyle = "log"
    ) {
      entries.push({
        id: ++nextId,
        level,
        scope,
        style,
        values: snapshotArguments(args),
      });
      if (entries.length > limit) entries.splice(0, entries.length - limit);
      for (const listener of listeners) listener();
    },
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
export type LogStore = ReturnType<typeof createLogStore>;
