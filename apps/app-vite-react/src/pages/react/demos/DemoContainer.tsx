import { useId, useState, type ComponentType } from "react";

export default function DemoContainer({ Cmp }: { Cmp?: ComponentType }) {
  const [visible, setVisible] = useState(false);
  const resultId = useId();
  if (!Cmp) return null;

  return (
    <div>
      <button
        type="button"
        aria-expanded={visible}
        aria-controls={resultId}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? "隐藏" : "显示"}运行结果
      </button>
      <div id={resultId} hidden={!visible} style={{ padding: "10px 0" }}>
        {visible && <Cmp />}
      </div>
    </div>
  );
}
