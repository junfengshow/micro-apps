import { useEffect, useState } from "react";

export default function Clock() {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);
  return <p>已运行 {seconds} 秒</p>;
}
