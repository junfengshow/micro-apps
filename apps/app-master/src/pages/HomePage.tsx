import { Button, Card, Empty, Tag, Typography } from "antd";
import { Link } from "react-router";
import { microApps } from "@/micro/apps";
import type { EngineName } from "@/micro/types";

const engineLabels: Record<EngineName, string> = {
  qiankun: "qiankun",
  "micro-app": "micro-app",
  wujie: "Wujie",
  federation: "Module Federation",
};

const benefits = [
  {
    title: "团队独立交付",
    description:
      "按业务域划分应用和代码所有权，团队可以独立开发、构建与发布，减少多人同时改动同一前端工程的等待。",
  },
  {
    title: "渐进式迁移",
    description:
      "把遗留页面或新业务逐步接入统一入口，不必一次性重写整套系统；迁移期间新旧技术栈可以并存。",
  },
  {
    title: "技术栈共存",
    description:
      "不同业务可以根据团队和历史包袱选择 React、Vue、Angular 等框架，同时保留统一导航和用户体验。",
  },
  {
    title: "按业务演进",
    description:
      "子应用可独立安排构建、部署和发布节奏，并按各自使用情况优化资源交付。主应用负责入口、路由和公共约定，子应用负责自己的业务界面。",
  },
];

const runtimeSteps = [
  {
    title: "注册子应用",
    description:
      "主应用登记名称、入口、路由规则和所用引擎；子应用提供可加载的资源及挂载、卸载约定。",
  },
  {
    title: "匹配并加载",
    description:
      "用户进入某个业务路由后，主应用按需加载对应入口或远程模块，未访问的子应用通常不会参与首屏加载。",
  },
  {
    title: "挂载并协作",
    description:
      "运行时把子应用挂到指定容器，并按方案处理脚本、样式、路由和数据通信；隔离强度取决于所选机制。",
  },
  {
    title: "切换并清理",
    description:
      "离开页面时调用卸载生命周期，清除事件、定时器和应用实例，避免重复挂载造成资源泄漏或状态串扰。",
  },
];

// 同时比较框架型运行时、模块共享机制和浏览器原生隔离，避免把它们当成同一层工具。
const technologies = [
  {
    name: "qiankun",
    type: "应用编排框架",
    mechanism:
      "基于 single-spa 生命周期，常用 HTML 入口加载 UMD 子应用；可配置 JS 沙箱和样式隔离。",
    strengths:
      "生态和实践较成熟，路由、生命周期、应用间通信等常用能力齐全；适合逐步接入已有 Web 应用。",
    tradeoffs:
      "子应用通常需要适配生命周期和构建格式；沙箱与样式隔离需要正确配置，动态脚本、全局变量等边界仍需验证。",
  },
  {
    name: "micro-app",
    type: "Web Component 容器",
    mechanism:
      "以自定义元素承载子应用，常通过 HTML 入口加载，并提供沙箱、样式处理、数据通信和路由模式等能力。",
    strengths:
      "接入形态直观，对子应用框架限制较少；可按应用配置路由与隔离策略，适合混合技术栈和渐进迁移。",
    tradeoffs:
      "运行时会介入资源加载和浏览器行为；特殊构建产物、样式写法及第三方脚本需要逐项兼容验证。",
  },
  {
    name: "Wujie",
    type: "iframe 沙箱框架",
    mechanism:
      "组合 iframe 隔离与 Web Component 集成，提供子应用生命周期、路由同步和应用间通信能力。",
    strengths:
      "利用浏览器文档环境隔离降低全局变量冲突；可保留或销毁子应用实例，适合需要更强运行环境隔离的场景。",
    tradeoffs:
      "iframe 带来额外的通信、路由和调试成本；登录态、弹窗、下载等跨文档行为需要明确约定。",
  },
  {
    name: "Module Federation",
    type: "模块级远程加载",
    mechanism:
      "Webpack 5 等构建工具将模块暴露为 remote，由宿主在运行时加载，并通过 share scope 协商依赖版本。",
    strengths:
      "可共享组件、函数或页面模块，远端可独立发布；共享依赖时有机会减少重复下载。",
    tradeoffs:
      "它不负责完整的应用路由、生命周期或沙箱隔离；构建配置、共享依赖版本和远端可用性需要统一治理。",
  },
  {
    name: "single-spa",
    type: "应用编排框架",
    mechanism:
      "根据路由激活应用，并按 bootstrap、mount、unmount 生命周期组织多个前端应用。",
    strengths:
      "框架适配面广，生命周期和路由编排清晰；需要高度定制宿主运行时的团队可以在此基础上组合能力。",
    tradeoffs:
      "更偏编排底座，脚本加载、样式隔离和通信等常需自行搭配；工程接入与治理工作相对更多。",
  },
  {
    name: "Garfish",
    type: "微前端运行时",
    mechanism:
      "提供子应用加载、生命周期、路由、沙箱和应用间通信等运行时能力，可按需要组合插件。",
    strengths:
      "覆盖面较完整、可配置能力较多，适合需要集中管理子应用运行规则的中大型系统。",
    tradeoffs:
      "引入的运行时概念和配置较多；团队需评估社区活跃度、版本维护及与现有构建体系的适配成本。",
  },
  {
    name: "原生 iframe",
    type: "浏览器文档隔离",
    mechanism:
      "每个子应用运行在独立浏览上下文中，通过 URL 和 postMessage 等浏览器机制协作。",
    strengths:
      "脚本和 CSS 隔离边界清楚，框架与构建工具几乎不受限制；适合跨团队、跨域或可信度不同的内容。",
    tradeoffs:
      "导航、尺寸、自适应、键盘焦点、单点登录和消息协议都需要额外处理；整体体验和性能需仔细设计。",
  },
];

const selectionTips = [
  "优先定义业务边界、团队所有权和发布流程，再决定技术方案；微前端不会自动解决跨业务数据一致性。",
  "需要完整页面级隔离时优先评估 iframe 系方案；需要共享组件或函数时评估 Module Federation，并另行设计路由与生命周期。",
  "选框架时同时验证子应用构建格式、CSS 隔离、路由刷新、登录态、资源跨域和卸载清理，不要只比较接入代码行数。",
  "如果系统由单一团队维护、共用技术栈且可统一发布，模块化单体通常更简单；微前端的独立交付收益应足以覆盖运行时和治理成本。",
];

export function HomePage() {
  return (
    <main className="mx-auto max-w-6xl space-y-12 px-5 py-8 lg:px-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Typography.Title level={2} className="!mb-2">
            应用概览
          </Typography.Title>
          <Typography.Paragraph type="secondary" className="!mb-0">
            已接入 {microApps.length}{" "}
            个应用，下面也提供微前端概念与方案选型参考。
          </Typography.Paragraph>
        </div>
        <Tag color="blue">微前端工作台</Tag>
      </header>

      <section aria-labelledby="apps-heading" className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Typography.Title id="apps-heading" level={4} className="!mb-0">
            接入示例
          </Typography.Title>
          <Typography.Text type="secondary">
            选择应用查看运行效果
          </Typography.Text>
        </div>
        {microApps.length === 0 ? (
          <Card>
            <Empty description="暂无接入应用" />
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {microApps.map((app) => (
              <Card key={app.name} title={app.title}>
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-600">
                  <span>运行方案</span>
                  <Tag>{engineLabels[app.engine]}</Tag>
                </div>
                <Link to={`/apps/${app.name}`}>
                  <Button type="primary">打开应用</Button>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>

      <article
        aria-labelledby="guide-heading"
        className="space-y-12 border-t border-slate-200 pt-10"
      >
        <header className="max-w-4xl space-y-3">
          <Typography.Text className="text-xs font-semibold uppercase text-blue-700">
            Micro Frontends
          </Typography.Text>
          <Typography.Title id="guide-heading" level={3} className="!mb-0">
            微前端是什么
          </Typography.Title>
          <Typography.Paragraph className="!mb-0 text-base leading-7 text-slate-700">
            微前端是一种把大型前端产品拆成多个小型、可独立开发和交付应用的架构方式。它借鉴了微服务的团队自治思想，但拆分发生在浏览器界面与前端工程层：主应用提供统一入口、导航和公共约定，子应用负责各自的业务区域，运行时再把它们组合成完整产品。
          </Typography.Paragraph>
          <Typography.Paragraph type="secondary" className="!mb-0 leading-7">
            微前端不是特定框架，也不代表每个子应用都必须使用不同技术栈。关键是明确应用边界、独立交付责任，以及应用之间如何加载、隔离和协作。
          </Typography.Paragraph>
        </header>

        <section aria-labelledby="benefits-heading" className="space-y-5">
          <div className="max-w-3xl">
            <Typography.Title id="benefits-heading" level={4}>
              微前端有什么作用
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="!mb-0">
              它主要解决大型前端在组织协作、历史迁移和发布节奏上的问题，同时也会增加集成与运行时治理成本。
            </Typography.Paragraph>
          </div>
          <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {benefits.map((item) => (
              <section
                key={item.title}
                className="border-l-2 border-blue-600 pl-4"
              >
                <Typography.Title level={5} className="!mb-2">
                  {item.title}
                </Typography.Title>
                <Typography.Paragraph
                  type="secondary"
                  className="!mb-0 leading-6"
                >
                  {item.description}
                </Typography.Paragraph>
              </section>
            ))}
          </div>
        </section>

        <section aria-labelledby="runtime-heading" className="space-y-5">
          <div className="max-w-3xl">
            <Typography.Title id="runtime-heading" level={4}>
              一个典型的运行过程
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="!mb-0">
              常见实现会经历注册、加载、挂载和卸载；不同框架对资源解析、沙箱和路由同步的处理并不相同。
            </Typography.Paragraph>
          </div>
          <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            {runtimeSteps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700">
                  {index + 1}
                </span>
                <div>
                  <Typography.Title level={5} className="!mb-1">
                    {step.title}
                  </Typography.Title>
                  <Typography.Paragraph
                    type="secondary"
                    className="!mb-0 leading-6"
                  >
                    {step.description}
                  </Typography.Paragraph>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="technology-heading" className="space-y-5">
          <div className="max-w-4xl">
            <Typography.Title id="technology-heading" level={4}>
              主流技术与优缺点
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="!mb-0">
              下面按职责比较常见选择。框架型运行时通常负责应用编排，Module
              Federation 负责远程模块共享，iframe
              则是浏览器提供的隔离手段；它们可以组合使用。
            </Typography.Paragraph>
          </div>

          <div className="space-y-4">
            <div className="hidden grid-cols-[minmax(145px,0.8fr)_minmax(180px,1fr)_minmax(220px,1.4fr)_minmax(220px,1.4fr)] gap-5 border-b border-slate-300 pb-3 text-xs font-semibold text-slate-500 xl:grid">
              <span>方案</span>
              <span>实现方式</span>
              <span>优势</span>
              <span>限制与成本</span>
            </div>
            {technologies.map((technology) => (
              <div
                key={technology.name}
                className="grid gap-3 border-b border-slate-200 pb-5 xl:grid-cols-[minmax(145px,0.8fr)_minmax(180px,1fr)_minmax(220px,1.4fr)_minmax(220px,1.4fr)] xl:gap-5"
              >
                <div>
                  <Typography.Title level={5} className="!mb-1">
                    {technology.name}
                  </Typography.Title>
                  <Typography.Text type="secondary" className="text-xs">
                    {technology.type}
                  </Typography.Text>
                </div>
                <div>
                  <Typography.Text className="mb-1 block text-xs font-semibold text-slate-500 xl:hidden">
                    实现方式
                  </Typography.Text>
                  <Typography.Paragraph className="!mb-0 leading-6">
                    {technology.mechanism}
                  </Typography.Paragraph>
                </div>
                <div>
                  <Typography.Text className="mb-1 block text-xs font-semibold text-slate-500 xl:hidden">
                    优势
                  </Typography.Text>
                  <Typography.Paragraph className="!mb-0 leading-6">
                    {technology.strengths}
                  </Typography.Paragraph>
                </div>
                <div>
                  <Typography.Text className="mb-1 block text-xs font-semibold text-slate-500 xl:hidden">
                    限制与成本
                  </Typography.Text>
                  <Typography.Paragraph
                    type="secondary"
                    className="!mb-0 leading-6"
                  >
                    {technology.tradeoffs}
                  </Typography.Paragraph>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="workspace-heading" className="space-y-4">
          <div className="max-w-4xl">
            <Typography.Title id="workspace-heading" level={4}>
              本工作台演示什么
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="!mb-0 leading-6">
              主应用用统一注册表维护入口和运行引擎，并通过适配器加载
              qiankun、micro-app、Wujie 或 Module Federation。当前示例覆盖
              Vue、React、Angular
              与远程模块共享，可从上方入口打开查看。实际项目中，隔离和路由能力还需要结合具体子应用配置。
            </Typography.Paragraph>
          </div>
        </section>

        <section aria-labelledby="selection-heading" className="space-y-4">
          <div className="max-w-4xl">
            <Typography.Title id="selection-heading" level={4}>
              如何选型与落地
            </Typography.Title>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {selectionTips.map((tip, index) => (
              <p
                key={tip}
                className="m-0 border-t border-slate-200 pt-3 leading-6 text-slate-700"
              >
                <span className="mr-2 font-semibold text-blue-700">
                  0{index + 1}
                </span>
                {tip}
              </p>
            ))}
          </div>
        </section>
      </article>
    </main>
  );
}
