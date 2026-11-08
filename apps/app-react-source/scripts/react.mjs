import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { delimiter, dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const source = fileURLToPath(new URL("../vendor/react/", import.meta.url));
function run(script, args, env = {}) {
  const result = spawnSync(process.execPath, [script, ...args], {
    cwd: source,
    stdio: "inherit",
    env: { ...process.env, ...env },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function javaEnvironment() {
  // 官方 Closure Compiler 需要 Java 11+。优先 JAVA_HOME，其次 PATH；
  // macOS 默认 java 可能仍为 Java 8，必要时从已安装的 JDK 中选择。
  const homes = process.env.JAVA_HOME ? [process.env.JAVA_HOME] : [];
  const candidates = homes.map((home) => ({
    home,
    binary: join(home, "bin", "java"),
  }));
  candidates.push({ binary: "java" });
  if (process.platform === "darwin") {
    const detected = spawnSync("/usr/libexec/java_home", ["-v", "11+"], {
      encoding: "utf8",
    });
    if (detected.status === 0) {
      const home = detected.stdout.trim();
      candidates.push({ home, binary: join(home, "bin", "java") });
    }
  }
  for (const { home, binary } of candidates) {
    const result = spawnSync(binary, ["-version"], { encoding: "utf8" });
    const match = `${result.stdout ?? ""}${result.stderr ?? ""}`.match(
      /(?:java|openjdk)(?: version)?\s+"?(\d+)(?:\.(\d+))?/
    );
    const major = match && Number(match[1] === "1" ? match[2] : match[1]);
    if (result.status === 0 && major >= 11) {
      console.log(`React 编译使用 Java ${major}：${binary}`);
      return home
        ? {
            JAVA_HOME: home,
            PATH: `${dirname(binary)}${delimiter}${process.env.PATH ?? ""}`,
          }
        : {};
    }
  }
  throw new Error(
    "React 官方 Closure Compiler 需要 Java 11+；请安装 JDK 并配置 JAVA_HOME 或 PATH，再执行 npm run react:build。"
  );
}

switch (process.argv[2]) {
  case "install":
    // 上游使用 Yarn 1 workspaces 和 link:，不要在 vendor/react 中执行 npm install。
    run(
      require.resolve("yarn/bin/yarn.js"),
      [
        "install",
        "--frozen-lockfile",
        "--non-interactive",
        "--registry",
        "https://registry.npmjs.org",
      ],
      // 上游 DevTools 工作区依赖 Electron，编译 React 不需要下载其桌面二进制。
      { ELECTRON_SKIP_BINARY_DOWNLOAD: "1" }
    );
    break;
  case "build": {
    const bundleTypes = [
      "NODE_DEV",
      // "NODE_PROD", // 日常源码调试跳过；需要正式包时传入 --production。
    ];
    if (process.argv.includes("--production")) bundleTypes.push("NODE_PROD");
    const cache = new URL("../.cache/", import.meta.url);
    // 编译失败时禁止 Vite 误用上一次成功构建的时间戳及不完整的新产物。
    rmSync(new URL("react-build.json", cache), { force: true });
    // 直接调用官方 Rollup 脚本，仅构建浏览器演示所需入口。
    // 不使用顶层 yarn build，避免同时构建多发布通道和 React Compiler。
    // bundles.js 已将其他目标注释保留，避免 CLI 子串匹配误选 jest-react/native。
    console.log(`React 构建类型：${bundleTypes.join(", ")}`);
    run(
      "scripts/rollup/build.js",
      [
        "react/index,react/jsx-runtime,react/jsx-dev-runtime,react-dom/index,react-dom/client,scheduler/index",
        `--type=${bundleTypes.join(",")}`,
      ],
      { ...javaEnvironment(), RELEASE_CHANNEL: "stable" }
    );
    mkdirSync(cache, { recursive: true });
    writeFileSync(
      new URL("react-build.json", cache),
      JSON.stringify(
        {
          tag: "v19.3.0",
          commit: "1d34f91dfde6bba84d08b683aaba164c7194dacb",
          compiledAt: new Date().toISOString(),
          bundleTypes,
        },
        null,
        2
      ) + "\n"
    );
    console.log("React 源码编译完成。请重启 npm run dev，再刷新页面。");
    break;
  }
  default:
    throw new Error("用法：node scripts/react.mjs install|build");
}
