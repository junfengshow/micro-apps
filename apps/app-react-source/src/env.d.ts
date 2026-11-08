/// <reference types="vite/client" />

type PageLogger = import("./console/capture").PageLogger;

declare const __REACT_SOURCE_BUILD__: {
  tag: string;
  commit: string;
  compiledAt: string;
};

interface Window {
  __MICRO_APP_ENVIRONMENT__?: boolean;
  mount?: () => void;
  unmount?: () => void;
  Logger?: PageLogger;
  MainLogger?: PageLogger;
  EventsLogger?: PageLogger;
  SchedulerLogger?: PageLogger;
  RenderLogger?: PageLogger;
  CommitLogger?: PageLogger;
  HooksLogger?: PageLogger;
}
