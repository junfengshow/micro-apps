import { useId } from "react";

export default function EmailField() {
  const id = useId();
  return (
    <>
      <label htmlFor={id}>邮箱</label>
      <input id={id} type="email" aria-describedby={id + "-help"} />
      <p id={id + "-help"}>用于接收学习资料。</p>
    </>
  );
}
