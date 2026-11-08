import { useEffect, useLayoutEffect, useRef, useState } from "react";

function MeasuredTitle({ title }: { title: string }) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  useLayoutEffect(() => {
    console.log(
      "已提交标题的宽度：",
      headingRef.current?.getBoundingClientRect().width
    );
  }, [title]);
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
  return <h2 ref={headingRef}>{title}</h2>;
}

export default function EffectPhasesDemo() {
  const [title, setTitle] = useState("React Effect 时序");
  return (
    <>
      <input
        aria-label="标题"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
      />
      <p>
        修改标题，观察页面标题与控制台中的布局测量；隐藏示例时会恢复原页面标题。
      </p>
      <MeasuredTitle title={title} />
    </>
  );
}
