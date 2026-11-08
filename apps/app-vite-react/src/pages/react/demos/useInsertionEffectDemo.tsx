import { useInsertionEffect } from "react";

function useAccentStyle(color: string) {
  useInsertionEffect(() => {
    const style = document.createElement("style");
    style.textContent = ".react-insertion-demo { color: " + color + "; }";
    document.head.appendChild(style);
    return () => style.remove();
  }, [color]);
}

export default function Label() {
  useAccentStyle("#087f6a");
  return <p className="react-insertion-demo">先准备样式，再读取布局</p>;
}
