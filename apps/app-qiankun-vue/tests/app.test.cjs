const assert = require("node:assert/strict");
const { readFileSync, readdirSync } = require("node:fs");
const path = require("node:path");
const { setTimeout: delay } = require("node:timers/promises");
const { test } = require("node:test");
const { JSDOM, ResourceLoader, VirtualConsole } = require("jsdom");

// 在 Node 的 DOM 模拟环境执行真实生产包；不启动浏览器，不发网络请求。
const dist = path.join(__dirname, "../dist");
const main = readdirSync(dist).find((name) => /^main\..*\.js$/.test(name));
assert.ok(main, "请先运行 npm run build");
class LocalChunks extends ResourceLoader {
  fetch(url) {
    const name = path.basename(new URL(url).pathname);
    if (!name.endsWith(".js")) return null;
    return Promise.resolve(readFileSync(path.join(dist, name)));
  }
}
async function waitFor(predicate) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (predicate()) return;
    await delay(10);
  }
  assert.ok(predicate(), "等待界面更新超时");
}
function setup(t, pathname = "/apps/app-qiankun-vue/", embedded = true) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (error) => errors.push(error));
  virtualConsole.on("error", (...args) => errors.push(args));
  const dom = new JSDOM(
    '<!doctype html><div id="host"><div id="app-qiankun-vue-root"></div></div>',
    {
      url: `http://localhost:3000${pathname}`,
      runScripts: "dangerously",
      resources: new LocalChunks(),
      virtualConsole,
    }
  );
  const { window } = dom;
  window.__POWERED_BY_QIANKUN__ = embedded;
  window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ = "http://localhost:7101/";
  window.eval(readFileSync(path.join(dist, main), "utf8"));
  const lifecycle = window.appQiankunVue;
  t.after(async () => {
    await lifecycle.unmount();
    window.close();
    assert.deepEqual(errors, [], "生产包不应输出运行时错误");
  });
  const document = window.document;
  const button = (text) =>
    [...document.querySelectorAll("button")].find((node) =>
      node.textContent.includes(text)
    );
  return {
    window,
    document,
    lifecycle,
    button,
    host: document.querySelector("#host"),
  };
}

test("嵌入模式：容器隔离、五页面路由、卸载与重复挂载", async (t) => {
  const { document, window, lifecycle, host } = setup(t);
  const outside = document.createElement("div");
  outside.id = "app-qiankun-vue-root";
  outside.textContent = "宿主外部内容";
  document.body.prepend(outside);
  await lifecycle.bootstrap();
  await lifecycle.mount({ container: host, basePath: "/apps/app-qiankun-vue" });
  assert.match(host.textContent, /自然生长/);
  assert.equal(outside.textContent, "宿主外部内容");
  for (const [route, text] of [
    ["products", "灵感盒子"],
    ["solutions", "一起发现问题"],
    ["about", "保持好奇"],
    ["contact", "怎么称呼你"],
  ]) {
    const target = `/apps/app-qiankun-vue/${route}`;
    host.querySelector(`a[href="${target}"]`).click();
    await waitFor(
      () =>
        window.location.pathname === target && host.textContent.includes(text)
    );
  }
  const form = host.querySelector("form");
  form.dispatchEvent(
    new window.Event("submit", { bubbles: true, cancelable: true })
  );
  await waitFor(() => host.textContent.includes("消息没有发送到服务器"));
  await lifecycle.unmount();
  assert.equal(host.firstElementChild.innerHTML, "");
  window.history.replaceState({}, "", "/apps/app-qiankun-vue/");
  await lifecycle.mount({ container: host, basePath: "/apps/app-qiankun-vue" });
  assert.match(host.textContent, /自然生长/);
  assert.equal(host.querySelectorAll(".studio-shell").length, 1);
});

test("Vue 手册：深链、搜索筛选、展开答案、剪贴板反馈与章节切换", async (t) => {
  const { document, window, lifecycle, button, host } = setup(
    t,
    "/apps/app-qiankun-vue/vue?chapter=interview"
  );
  await lifecycle.mount({ container: host, basePath: "/apps/app-qiankun-vue" });
  assert.equal(document.querySelectorAll("details").length, 18);
  const search = document.querySelector('input[type="search"]');
  search.value = "请求 乱序";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  await waitFor(() => document.querySelectorAll("details").length === 1);
  assert.match(
    document.querySelector("details").textContent,
    /AbortController/
  );
  button("展开全部答案").click();
  await waitFor(() => document.querySelector("details").open);
  let clipboard = "";
  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (text) => {
        clipboard = text;
      },
    },
  });
  button("复制代码").click();
  await waitFor(() => document.body.textContent.includes("代码已复制"));
  assert.match(clipboard, /onCleanup/);
  search.value = "不存在的知识xyz";
  search.dispatchEvent(new window.Event("input", { bubbles: true }));
  await waitFor(() => document.querySelector(".empty-state"));
  button("清除筛选").click();
  await waitFor(() => document.querySelectorAll("details").length === 18);
  button("故障排查").click();
  await waitFor(() => document.querySelectorAll("details").length === 3);
  const difficulty = document.querySelector("select");
  difficulty.value = "高级";
  difficulty.dispatchEvent(new window.Event("change", { bubbles: true }));
  await waitFor(() => document.querySelectorAll("details").length === 2);
  button("响应式原理").click();
  await waitFor(() => document.querySelector(".live-demo"));
  button("计数 +3").click();
  await waitFor(
    () => document.querySelector(".demo-values strong").textContent === "3"
  );
  assert.match(
    document.querySelector(".demo-controls").textContent,
    /nextTick 后 DOM：3/
  );
  button("重置").click();
  await waitFor(
    () => document.querySelector(".demo-values strong").textContent === "0"
  );
  assert.equal(window.location.search, "?chapter=reactivity");
});

test("独立运行自动挂载，未知路由回到首页", async (t) => {
  const { document, window } = setup(t, "/unknown", false);
  await waitFor(() => document.querySelector(".home-hero"));
  assert.equal(window.location.pathname, "/");
  assert.equal(
    document
      .querySelector('.topbar a[href="/vue"]')
      .textContent.includes("Vue"),
    true
  );
});
