import { useOptimistic, useState } from "react";

export default function Like() {
  const [likes, setLikes] = useState(0);
  const [optimistic, addLike] = useOptimistic<number, void>(
    likes,
    (n) => n + 1
  );
  const [error, setError] = useState("");
  async function like() {
    addLike();
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setLikes((n) => n + 1);
    } catch {
      setError("保存失败，请重试");
    }
  }
  return (
    <form action={like}>
      <button>赞 {optimistic}</button>
      <p role="status">{error}</p>
    </form>
  );
}
