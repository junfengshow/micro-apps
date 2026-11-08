import { useFormStatus } from "react-dom";

function Submit() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>{pending ? "提交中…" : "提交"}</button>;
}

export default function Feedback() {
  async function send() {
    await new Promise((resolve) => setTimeout(resolve, 600));
  }
  return (
    <form action={send}>
      <input name="message" aria-label="留言" required />
      <Submit />
    </form>
  );
}
