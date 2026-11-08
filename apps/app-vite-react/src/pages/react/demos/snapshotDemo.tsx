import { useState } from "react";

export default function Profile() {
  const [user, setUser] = useState({ name: "小林", score: 0 });
  return (
    <button
      onClick={() => {
        setUser((previous) => ({ ...previous, score: previous.score + 1 }));
      }}
    >
      {user.name}：{user.score} 分
    </button>
  );
}
