import { useState } from "react";
function InputEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <input
      aria-label="名称"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
export default function Page() {
  const [name, setName] = useState("");
  return <InputEditor value={name} onChange={setName} />;
}
