import { createContext, useContext } from "react";

const ThemeContext = createContext("light");

function ThemeLabel() {
  const theme = useContext(ThemeContext);
  return <p>当前主题：{theme}</p>;
}

export default function App() {
  return (
    <ThemeContext value="dark">
      <ThemeLabel />
    </ThemeContext>
  );
}
