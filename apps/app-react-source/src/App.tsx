import { version } from "react";

export function App() {
  return (
    <header className="runtime-info" aria-label="构建信息">
      <span>
        React <strong>{version}</strong>
      </span>
      <span>
        编译时间{" "}
        <time dateTime={__REACT_SOURCE_BUILD__.compiledAt}>
          {new Date(__REACT_SOURCE_BUILD__.compiledAt).toLocaleString("zh-CN", {
            timeZone: "Asia/Shanghai",
            hour12: false,
          })}
        </time>
      </span>
    </header>
  );
}
