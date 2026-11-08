import { createContext, use } from "react";

const Theme = createContext("light");

function Label({ showTheme }: { showTheme: boolean }) {
  if (!showTheme) return <p>未显示主题</p>;
  // use 可以出现在条件分支中。
  const theme = use(Theme);
  return <p>主题：{theme}</p>;
}

export default function App() {
  return (
    <Theme value="dark">
      <Label showTheme />
    </Theme>
  );
}
