import assert from "node:assert/strict";
import { setTimeout as delay } from "node:timers/promises";

// 仅使用 HTTP 请求检查服务和资源，不启动浏览器或执行页面脚本。
async function get(url) {
  // 单次 HTTP 请求最多等待 3 秒，避免不可达的服务阻塞检查。
  const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
  assert.equal(response.status, 200, `${url} 应返回 200`);
  return response;
}
// 主应用临时换端口时使用 MASTER_PORT=3001 node scripts/check-http.mjs。
const masterPort = Number(process.env.MASTER_PORT || 3000);
// 子应用端口与各自构建配置、主应用注册表保持一致；此脚本只检查已有服务。
const apps = [
  ["app-master", masterPort],
  ["app-qiankun-vue", 7101],
  ["app-micro-app", 7102],
  ["app-wujie-angular", 7103],
  ["app-federation", 7104],
  ["app-vite-react", 7100],
  ["app-react-source", 7105],
];
for (const [name, port] of apps) {
  const origin = `http://localhost:${port}`;
  let response;
  // 入口最多尝试 40 次，失败后间隔 500ms，为开发服务初次编译留出时间。
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      response = await get(origin);
      break;
    } catch (error) {
      if (attempt === 39) throw error;
      await delay(500);
    }
  }
  const html = await response.text();
  assert.match(html, /<html/);
  const scripts = [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(
    (match) => match[1]
  );
  // 既有 Vite 应用的 qiankun 插件将入口改写为内联 import 表达式。
  if (name === "app-vite-react" || name === "app-react-source") {
    scripts.push(
      ...[...html.matchAll(/['"](\/(?:src\/[^'"]+|@vite\/client))['"]/g)].map(
        (match) => match[1]
      )
    );
  }
  assert.ok(scripts.length, `${name} 应包含脚本入口`);
  for (const src of scripts) {
    const script = await get(new URL(src, origin));
    assert.match(script.headers.get("content-type"), /javascript/);
    if (port >= 7101 && port <= 7104)
      assert.equal(script.headers.get("access-control-allow-origin"), "*");
  }
  console.log(`PASS ${name}: HTML、脚本入口、资源 CORS`);
}
for (const name of [
  "app-qiankun-vue",
  "app-micro-app",
  "app-wujie-angular",
  "app-federation",
]) {
  const html = await (
    await get(`http://localhost:${masterPort}/apps/${name}`)
  ).text();
  assert.match(html, /id="root"/);
}
const remote = await (await get("http://localhost:7104/remoteEntry.js")).text();
assert.ok(remote.includes("appFederation") && remote.includes("./mount"));
console.log("PASS 主应用深层链接回退、Module Federation 容器与暴露模块");
