import { useState } from "react";

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label>
      {label}
      <input value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

export default function SyncedFields() {
  const [text, setText] = useState("共享内容");
  return (
    <>
      <Field label="A" value={text} onChange={setText} />
      <Field label="B" value={text} onChange={setText} />
    </>
  );
}
