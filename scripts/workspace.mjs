import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

// 无根 package.json：每个应用保留自己的 package.json、锁文件与 node_modules。
const allApps = [
  "app-master",
  "app-qiankun-vue",
  "app-micro-app",
  "app-wujie-angular",
  "app-federation",
  "app-vite-react",
  "app-react-source",
];
// 第一个参数指定命令，后续参数可限定应用；省略应用名时处理整个列表。
const apps = process.argv.length > 3 ? process.argv.slice(3) : allApps;
const command = process.argv[2];
if (
  !["install", "dev", "build", "typecheck", "format", "format:check"].includes(
    command
  )
) {
  console.error(
    "用法：node scripts/workspace.mjs install|dev|build|typecheck|format|format:check [应用名...]"
  );
  process.exit(1);
}
if (apps.some((app) => !allApps.includes(app))) {
  console.error("未知应用，可选值：", allApps.join(", "));
  process.exit(1);
}
const children = new Set();
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  process.exitCode = code;
  for (const child of children) {
    try {
      if (process.platform === "win32") child.kill("SIGTERM");
      else process.kill(-child.pid, "SIGTERM");
    } catch {
      /* 已退出的进程无需再次终止。 */
    }
  }
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());

function run(app) {
  console.log(`[${app}] ${command}`);
  return new Promise((resolve, reject) => {
    // install 优先复用本地缓存；其他命令转发到各应用自己的 npm scripts。
    const child = spawn(
      process.platform === "win32" ? "npm.cmd" : "npm",
      command === "install"
        ? ["install", "--prefer-offline"]
        : ["run", command],
      {
        cwd: fileURLToPath(new URL(`../apps/${app}/`, import.meta.url)),
        // 直接输出各应用日志；非 Windows 创建进程组，退出时可统一终止子服务。
        stdio: "inherit",
        detached: process.platform !== "win32",
      }
    );
    children.add(child);
    child.once("error", reject);
    child.once("exit", (code) => {
      children.delete(child);
      if (stopping) resolve();
      else if (command === "dev" || code !== 0)
        reject(new Error(`${app} 已退出（${code}）`));
      else resolve();
    });
  });
}
try {
  // 开发服务并发常驻；安装、检查、构建按应用顺序执行，失败即停止。
  if (command === "dev") await Promise.all(apps.map(run));
  else for (const app of apps) await run(app);
} catch (error) {
  console.error(error);
  stop(1);
}
