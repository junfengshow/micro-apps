import { useSyncExternalStore } from "react";

function subscribe(notify: () => void) {
  window.addEventListener("online", notify);
  window.addEventListener("offline", notify);
  return () => {
    window.removeEventListener("online", notify);
    window.removeEventListener("offline", notify);
  };
}
const getSnapshot = () => navigator.onLine;
const getServerSnapshot = () => true;

export default function NetworkStatus() {
  const online = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return <p>{online ? "在线" : "离线"}</p>;
}
