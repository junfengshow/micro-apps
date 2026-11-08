import { useState } from "react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setMessage("本地演示，已收到：" + email);
      }}
    >
      <input
        type="email"
        aria-label="邮箱"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">订阅</button>
      <p role="status">{message}</p>
    </form>
  );
}
