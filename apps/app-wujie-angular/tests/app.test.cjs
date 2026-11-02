const assert = require("node:assert/strict");
const { test } = require("node:test");
const { readFileSync, readdirSync } = require("node:fs");
const { join } = require("node:path");
const { JSDOM, VirtualConsole } = require("jsdom");

// 在 Node 的 DOM 模拟环境执行真实生产包；不启动/控制浏览器。
const dist = join(__dirname, "../dist");
const bundle = readFileSync(
  join(
    dist,
    readdirSync(dist).find((name) => /^main\..*\.js$/.test(name))
  ),
  "utf8"
);
const pause = () => new Promise((resolve) => setTimeout(resolve, 60));
async function waitFor(check) {
  for (let attempt = 0; attempt < 50; attempt++) {
    if (check()) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  assert.ok(check(), "等待 Angular 渲染超时");
}
async function createApp(
  t,
  path = "#/",
  { embedded = false, shadow = false } = {}
) {
  const errors = [];
  const virtualConsole = new VirtualConsole();
  virtualConsole.on("jsdomError", (error) => errors.push(error));
  virtualConsole.on("error", (...args) => errors.push(args.join(" ")));
  const dom = new JSDOM(
    '<!doctype html><html><head></head><body><div id="app-wujie-angular-root"></div></body></html>',
    {
      url: `http://localhost:7103/${path}`,
      runScripts: "outside-only",
      pretendToBeVisual: true,
      virtualConsole,
    }
  );
  // 模拟 Wujie：JS 在子应用窗口执行，渲染节点被移入主应用 Shadow DOM。
  const hostDom = shadow
    ? new JSDOM("<div id='micro-app'></div>", {
        url: "http://localhost:3000/apps/app-wujie-angular",
        virtualConsole,
      })
    : undefined;
  const shadowRoot = hostDom?.window.document
    .getElementById("micro-app")
    .attachShadow({ mode: "open" });
  if (shadowRoot) {
    shadowRoot.appendChild(
      dom.window.document.getElementById("app-wujie-angular-root")
    );
    const getElementById = dom.window.document.getElementById.bind(
      dom.window.document
    );
    dom.window.document.getElementById = (id) =>
      shadowRoot.getElementById(id) || getElementById(id);
  }
  t.after(() => {
    dom.window.close();
    hostDom?.window.close();
    assert.deepEqual(errors, [], "运行期间不应出现 Angular 或 DOM 异常");
  });
  dom.window.__POWERED_BY_WUJIE__ = embedded;
  dom.window.eval(bundle);
  if (!embedded) {
    await waitFor(() => dom.window.document.querySelector("h1"));
    await pause();
  }
  const document = shadowRoot || dom.window.document;
  const root = () => document.querySelector("#app-wujie-angular-root");
  const app = {
    window: dom.window,
    hostWindow: hostDom?.window,
    document,
    root,
    path: () => dom.window.location.hash.slice(1).split("?")[0] || "/",
    search: () =>
      Object.fromEntries(
        new URLSearchParams(dom.window.location.hash.split("?")[1] || "")
      ),
    async route(path, search = {}) {
      dom.window.location.hash =
        path +
        (Object.keys(search).length ? "?" + new URLSearchParams(search) : "");
      await pause();
    },
    async input(selector, value) {
      const element = document.querySelector(selector);
      assert.ok(element, `应找到 ${selector}`);
      element.value = value;
      element.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
      await pause();
    },
    async click(selector) {
      const element = document.querySelector(selector);
      assert.ok(element, `应找到 ${selector}`);
      element.click();
      await pause();
    },
  };
  return app;
}

test("Angular 22 AOT 生产包可渲染首页及所有路由", async (t) => {
  const app = await createApp(t);
  assert.equal(
    app.root().firstElementChild.getAttribute("ng-version"),
    "22.2.4"
  );
  assert.equal(app.window.angular, undefined, "不应再加载 AngularJS");
  assert.match(app.document.querySelector("h1").textContent, /好的想法/);
  for (const [path, title] of [
    ["/products", "为日常创造"],
    ["/solutions", "从问题出发"],
    ["/about", "保持好奇"],
    ["/contact", "下一件有趣的事"],
    ["/angular", "知识手册"],
  ]) {
    await app.route(path);
    assert.ok(app.document.querySelector("h1").textContent.includes(title));
    assert.match(app.document.title, /Angular Studio/);
  }
  await app.route("/does-not-exist");
  assert.equal(app.path(), "/");
  await app.click(".hero-actions .button");
  assert.equal(app.path(), "/products");
  await app.click(".skip-link");
  assert.equal(app.document.activeElement.id, "main-content");
  assert.equal(app.path(), "/products");
});

test("主应用 Shadow DOM 内的真实链接点击只更新子应用路由", async (t) => {
  const app = await createApp(t, "#/", { embedded: true, shadow: true });
  const hostUrl = app.hostWindow.location.href;
  await app.window.__WUJIE_MOUNT();
  await pause();
  for (const [path, title] of [
    ["/products", "为日常创造"],
    ["/solutions", "从问题出发"],
    ["/about", "保持好奇"],
    ["/contact", "下一件有趣的事"],
    ["/angular", "知识手册"],
  ]) {
    await app.click('.topbar a[href="#' + path + '"]');
    assert.equal(app.path(), path);
    assert.ok(app.document.querySelector("h1").textContent.includes(title));
    assert.equal(app.hostWindow.location.href, hostUrl);
  }
  await app.click('.book-sidebar a[href="#/"]');
  assert.equal(app.path(), "/");
  await app.click(".handbook-promo .card-link b");
  assert.equal(app.path(), "/angular");
  await app.click(".book-tabs button:last-child");
  await app.input("#handbook-search", "OnPush");
  assert.equal(app.document.querySelectorAll(".entry").length, 1);
  assert.equal(app.search().q, "OnPush");
  await app.click('.topbar a[href="#/products"]');
  assert.deepEqual(Object.keys(app.search()), []);
  app.window.history.back();
  await pause();
  await pause();
  assert.equal(app.path(), "/angular");
  assert.equal(app.search().q, "OnPush");
  assert.equal(app.document.querySelectorAll(".entry").length, 1);
  await app.click(".skip-link");
  assert.equal(app.document.activeElement.id, "main-content");
  assert.equal(app.path(), "/angular");
  assert.equal(app.hostWindow.location.href, hostUrl);
  app.window.__WUJIE_UNMOUNT();
  await app.window.__WUJIE_MOUNT();
  await pause();
  await app.click('.topbar a[href="#/about"]');
  assert.equal(app.path(), "/about");
  assert.equal(app.hostWindow.location.href, hostUrl);
  app.window.__WUJIE_UNMOUNT();
});

test("跳至主要内容默认裁剪隐藏，聚焦后可用", async (t) => {
  const app = await createApp(t);
  const link = app.document.querySelector(".skip-link");
  const hidden = app.window.getComputedStyle(link);
  assert.equal(hidden.clipPath, "inset(50%)");
  assert.equal(hidden.width, "1px");
  assert.equal(hidden.height, "1px");
  assert.equal(
    app.window.getComputedStyle(app.document.querySelector(".studio-shell"))
      .position,
    "relative"
  );
  link.focus();
  // jsdom 不会因焦点变化刷新计算样式缓存，单独核对焦点匹配和显示规则。
  const focusRule = Array.from(app.document.styleSheets)
    .flatMap((sheet) => Array.from(sheet.cssRules))
    .find(
      (rule) =>
        rule.selectorText === "#app-wujie-angular-root .skip-link:focus-visible"
    );
  assert.ok(link.matches(focusRule.selectorText));
  assert.equal(focusRule.style.getPropertyValue("clip-path"), "none");
  assert.equal(focusRule.style.width, "auto");
  assert.equal(focusRule.style.height, "auto");
  await app.click(".skip-link");
  assert.equal(app.document.activeElement.id, "main-content");
  assert.equal(link.matches(focusRule.selectorText), false);
  assert.equal(app.window.getComputedStyle(link).clipPath, "inset(50%)");
});

test("Angular Signals、computed、输入更新和重置", async (t) => {
  const app = await createApp(t, "#/angular");
  assert.equal(app.document.querySelectorAll(".entry").length, 4);
  assert.ok(app.document.querySelector("details").open, "知识条目默认展开");
  await app.input(".demo-controls input", "小林");
  assert.match(
    app.document.querySelector(".demo-panel").textContent,
    /你好，\s*小林/
  );
  await app.click(".demo-controls button");
  assert.equal(app.document.querySelector("output").textContent, "1");
  assert.equal(app.document.querySelector(".demo-doubled").textContent, "2");
  await app.click(".demo-controls .quiet");
  assert.equal(app.document.querySelector("output").textContent, "0");
});

test("面试题分类、组合筛选、空状态以及 URL 恢复", async (t) => {
  const app = await createApp(t, "#/angular?tab=interview");
  assert.equal(app.document.querySelectorAll(".entry").length, 12);
  assert.equal(
    app.document.querySelector("details").open,
    false,
    "面试题默认折叠"
  );
  await app.click("details summary");
  assert.equal(app.document.querySelector("details").open, true);
  await app.input("#handbook-search", "OnPush");
  assert.equal(app.document.querySelectorAll(".entry").length, 1);
  assert.equal(app.search().q, "OnPush");
  await app.input("#handbook-search", "没有这个内容xyz");
  assert.ok(app.document.querySelector(".empty-state"));
  await app.click(".empty-state button");
  assert.equal(app.document.querySelectorAll(".entry").length, 12);
  await app.route("/angular", {
    tab: "interview",
    group: "性能",
    level: "高级",
  });
  assert.equal(app.document.querySelectorAll(".entry").length, 2);
  await app.route("/angular", { tab: "interview", level: "专家" });
  assert.equal(app.document.querySelectorAll(".entry").length, 1);
  assert.match(app.document.querySelector(".entry h3").textContent, /微前端/);
  await app.route("/angular", {
    tab: "invalid",
    group: "invalid",
    level: "invalid",
  });
  assert.equal(app.document.querySelectorAll(".entry").length, 4);
  await app.click(".book-tabs button:nth-child(2)");
  assert.equal(app.search().tab, "angular");
  assert.match(app.document.querySelector(".entry h3").textContent, /Signal/);
});

test("键盘快捷键与复制成功/失败反馈", async (t) => {
  const app = await createApp(t, "#/angular?tab=angular");
  app.document.dispatchEvent(
    new app.window.KeyboardEvent("keydown", {
      key: "/",
      bubbles: true,
      cancelable: true,
    })
  );
  assert.equal(app.document.activeElement.id, "handbook-search");
  let copied;
  Object.defineProperty(app.window.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async (text) => {
        copied = text;
      },
    },
  });
  await app.click(".code-topbar button");
  assert.match(copied, /computed/);
  assert.match(
    app.document.querySelector(".copy-status").textContent,
    /已复制/
  );
  Object.defineProperty(app.window.navigator, "clipboard", {
    value: {
      writeText: async () => {
        throw new Error("denied");
      },
    },
  });
  await app.click(".code-topbar button");
  assert.match(
    app.document.querySelector(".copy-status").textContent,
    /手动选择/
  );
});

test("联系表单校验与演示提交", async (t) => {
  const app = await createApp(t, "#/contact");
  await app.click(".contact-form button");
  assert.ok(app.document.querySelector(".form-error"));
  assert.equal(app.document.querySelector(".form-success"), null);
  await app.input('[name="name"]', "小林");
  await app.input('[name="email"]', "invalid");
  await app.input('[name="message"]', "想聊聊产品设计");
  await app.click(".contact-form button");
  assert.ok(app.document.querySelector(".form-error"));
  await app.input('[name="email"]', "lin@example.com");
  await app.click(".contact-form button");
  assert.equal(app.document.querySelector(".form-error"), null);
  assert.match(
    app.document.querySelector(".form-success").textContent,
    /没有发送到服务器/
  );
});

test("Wujie 生命周期支持延迟启动、重复挂载与完整清理", async (t) => {
  const app = await createApp(t, "#/angular", { embedded: true });
  assert.equal(app.root().children.length, 0, "Wujie 模式等待宿主挂载");
  assert.equal(typeof app.window.__WUJIE_MOUNT, "function");
  for (let index = 0; index < 3; index++) {
    await app.window.__WUJIE_MOUNT();
    await pause();
    assert.equal(app.root().children.length, 1);
    assert.equal(app.document.querySelectorAll(".handbook").length, 1);
    const previousHost = app.root().firstElementChild;
    await app.click(".demo-controls button");
    assert.equal(app.document.querySelector("output").textContent, "1");
    await app.window.__WUJIE_MOUNT();
    await pause();
    assert.equal(previousHost.isConnected, false);
    previousHost.querySelector(".demo-controls button").click();
    await pause();
    assert.equal(
      previousHost.querySelector("output").textContent,
      "1",
      "销毁后旧视图的点击监听已释放"
    );
    assert.equal(app.root().children.length, 1);
    assert.equal(app.document.querySelector("output").textContent, "0");
    app.window.__WUJIE_UNMOUNT();
    app.window.__WUJIE_UNMOUNT();
    assert.equal(app.root().children.length, 0);
  }
  const event = new app.window.KeyboardEvent("keydown", {
    key: "/",
    cancelable: true,
  });
  app.document.dispatchEvent(event);
  assert.equal(event.defaultPrevented, false, "卸载后移除搜索快捷键");
});

test("Wujie 启动期间卸载和连续挂载不会留下迟到的应用", async (t) => {
  const app = await createApp(t, "#/angular", { embedded: true });
  const pending = app.window.__WUJIE_MOUNT();
  app.window.__WUJIE_UNMOUNT();
  await pending;
  await pause();
  assert.equal(app.root().children.length, 0);
  const first = app.window.__WUJIE_MOUNT();
  const second = app.window.__WUJIE_MOUNT();
  await Promise.all([first, second]);
  await pause();
  assert.equal(app.document.querySelectorAll("studio-app").length, 1);
  assert.equal(app.document.querySelectorAll(".handbook").length, 1);
  app.window.__WUJIE_UNMOUNT();
  const event = new app.window.KeyboardEvent("keydown", {
    key: "/",
    cancelable: true,
  });
  app.document.dispatchEvent(event);
  assert.equal(event.defaultPrevented, false);
});
