/// <reference types="vite/client" />

declare const __REACT_SOURCE_BUILD__: {
  tag: string;
  commit: string;
  compiledAt: string;
};

interface Window {
  __MICRO_APP_ENVIRONMENT__?: boolean;
  mount?: () => void;
  unmount?: () => void;
}
