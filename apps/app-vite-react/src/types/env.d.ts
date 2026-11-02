declare const __REACT_VERSION__: string;

interface Window {
  __MICRO_APP_ENVIRONMENT__?: boolean;
  mount?: () => void;
  unmount?: () => void;
}
