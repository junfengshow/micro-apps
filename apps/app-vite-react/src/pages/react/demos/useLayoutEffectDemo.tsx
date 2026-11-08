import { useLayoutEffect, useRef, useState } from "react";

export default function Measure() {
  const box = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  useLayoutEffect(() => {
    setWidth(box.current?.getBoundingClientRect().width ?? 0);
  }, []);
  return (
    <div ref={box} style={{ width: "100%" }}>
      首次布局宽度：{Math.round(width)} px
    </div>
  );
}
