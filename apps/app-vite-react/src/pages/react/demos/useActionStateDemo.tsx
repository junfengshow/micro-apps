import { useActionState, useId } from "react";
import { useFormStatus } from "react-dom";

async function save(_previous: { message: string }, formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  if (!name) return { message: "请填写姓名" };
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { message: "本地模拟保存成功：" + name };
}

function Profile() {
  const [state, action, pending] = useActionState(save, { message: "" });
  return (
    <form action={action}>
      <input name="name" aria-label="姓名" required />
      <button disabled={pending}>{pending ? "保存中…" : "保存"}</button>
      <p role="status">{state.message}</p>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "正在保存…" : "保存学习目标 →"}
    </button>
  );
}

function LearningGoalForm() {
  const id = useId();
  const [message, action, pending] = useActionState(
    async (_previous: string, data: FormData) => {
      const goal = String(data.get("goal") || "").trim();
      if (!goal) return "请先填写一个学习目标。";
      await new Promise((resolve) => setTimeout(resolve, 800));
      return `已完成本地模拟保存：${goal}`;
    },
    ""
  );
  return (
    <div className="rh-demo">
      <div>
        <span className="rh-kicker">试一试 · React 19 表单</span>
        <h3>两个 Hook，让提交状态各就其位。</h3>
      </div>
      <p>
        useActionState 保存结果，表单内部的按钮通过 useFormStatus 读取
        pending。数据仅在本页演示。
      </p>
      <form action={action} className="rh-demo-form" aria-busy={pending}>
        <label htmlFor={id}>我的下一个学习目标</label>
        <div>
          <input
            id={id}
            name="goal"
            placeholder="例如：理解 useEffect 的清理"
            required
            maxLength={100}
            disabled={pending}
          />
          <SubmitButton />
        </div>
        <p className="rh-form-message" role="status">
          {pending
            ? "模拟请求中，观察按钮的 pending 状态…"
            : message || "填写目标并提交，查看 Action 的返回结果。"}
        </p>
      </form>
    </div>
  );
}

export default function UseActionStateDemo() {
  return (
    <section>
      <h4>Action 返回状态与 pending</h4>
      <Profile />
      <LearningGoalForm />
    </section>
  );
}
