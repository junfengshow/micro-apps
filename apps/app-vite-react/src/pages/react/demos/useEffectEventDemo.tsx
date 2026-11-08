import { useEffect, useEffectEvent, useState } from "react";

export default function StepClock() {
  const [count, setCount] = useState(0);
  const [step, setStep] = useState(1);
  const onTick = useEffectEvent(() => {
    setCount((n) => n + step);
  });
  useEffect(() => {
    const timer = setInterval(() => onTick(), 1000);
    return () => clearInterval(timer);
  }, []);
  return (
    <button onClick={() => setStep((s) => s + 1)}>
      数值 {count}，步长 {step}（点击增大）
    </button>
  );
}
