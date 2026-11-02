export interface Entry {
  id: string;
  title: string;
  group: string;
  summary: string;
  points: string[];
  code: string;
  takeaway: string;
  source: string;
  level?: "进阶" | "高级" | "专家";
  prompt?: string;
  followUps?: string[];
  checks?: string[];
}
export interface Category {
  id: string;
  label: string;
  caption: string;
  description: string;
  entries: Entry[];
}
const basics: Entry[] = [
  {
    id: "standalone",
    title: "独立组件与应用启动",
    group: "组件设计",
    summary:
      "现代 Angular 用独立组件组织界面，组件显式声明自己的模板依赖，应用通过应用级 provider 配置服务和路由。",
    points: [
      "@Component 声明组件；imports 列出模板使用的组件、指令与管道。",
      "bootstrapApplication 启动独立根组件，provideRouter 配置路由。",
      "在微前端中可用 createApplication 创建应用，再把根组件挂到指定 DOM 节点。",
    ],
    code: "import { Component } from '@angular/core';\nimport { bootstrapApplication } from '@angular/platform-browser';\n\n@Component({\n  selector: 'app-root',\n  imports: [],\n  template: '<h1>Hello Angular</h1>'\n})\nexport class App {}\nbootstrapApplication(App);",
    takeaway: "独立组件无需声明在 NgModule 中，模板依赖仍需要显式导入。",
    source: "https://angular.dev/guide/components/importing",
  },
  {
    id: "template",
    title: "模板绑定与内置控制流",
    group: "模板",
    summary:
      "属性绑定把状态传入视图，事件绑定表达用户操作，@if 和 @for 直接描述条件与列表。",
    points: [
      "[disabled] 绑定 DOM 属性，(click) 监听事件，插值展示文本。",
      "@if 根据条件创建或销毁视图，@for 用稳定 key 复用列表。",
      "[(ngModel)] 用于模板驱动表单，使用时导入 FormsModule。",
    ],
    code: '@if (users().length) {\n  @for (user of users(); track user.id) {\n    <button (click)="select(user)">{{user.name}}</button>\n  }\n} @else {\n  <p>暂无用户</p>\n}',
    takeaway: "稳定 key 表达实体身份，排序或插入时不应使用可变位置作为身份。",
    source: "https://angular.dev/guide/templates/control-flow",
  },
  {
    id: "zoneless",
    title: "Signals 与无 Zone 更新",
    group: "响应机制",
    summary:
      "现代 Angular 可以在不依赖 Zone.js 的情况下调度变更检测，模板读取的 signal 更新会通知视图。",
    points: [
      "signal 保存状态，set 或 update 明确提交更新。",
      "computed 计算纯派生值，依赖变化时失效，并按需重新计算。",
      "第三方 SDK 回调写入 signal；只修改普通字段可能不足以通知视图。",
    ],
    code: "import { signal, computed } from '@angular/core';\n\nconst count = signal(0);\nconst doubled = computed(() => count() * 2);\n// 第三方 SDK 回调也通过 signal 通知视图\nconst unsubscribe = sdk.onChange(value => count.set(value));\ndestroyRef.onDestroy(unsubscribe);",
    takeaway:
      "Angular 22 默认使用无 Zone 变更检测；状态更新与资源清理仍应有明确的所有者。",
    source: "https://angular.dev/guide/zoneless",
  },
  {
    id: "typed-forms",
    title: "类型化表单与提交校验",
    group: "表单",
    summary:
      "FormControl 与 FormGroup 管理类型明确的表单值和校验状态，提交函数根据有效性决定后续操作。",
    points: [
      "nonNullable 保持控件值为非空类型。",
      "提交时 markAllAsTouched，让错误提示与用户操作一致。",
      "Validators.required 不会拒绝纯空格；文本内容可增加非空白校验。",
    ],
    code: "const form = new FormGroup({\n  email: new FormControl('', {\n    nonNullable: true,\n    validators: [Validators.required, Validators.email]\n  })\n});\nfunction submit() {\n  form.markAllAsTouched();\n  if (form.invalid || form.pending) return;\n  save(form.getRawValue());\n}",
    takeaway: "客户端校验用于交互体验，服务端仍需独立校验输入。",
    source: "https://angular.dev/guide/forms/typed-forms",
  },
];
const core: Entry[] = [
  {
    id: "signals",
    title: "Signal、computed 与 effect",
    group: "响应机制",
    summary:
      "Signal 表达响应式状态，computed 表达派生值，effect 用于与外部系统同步。",
    points: [
      "读取 signal 要调用 getter；set 替换值，update 基于旧值计算新值。",
      "computed 按需计算并缓存结果，其依赖来自实际读取的 signal。",
      "纯派生值优先使用 computed，避免用 effect 复制状态。",
    ],
    code: "import { signal, computed } from '@angular/core';\n\nconst count = signal(0);\nconst doubled = computed(() => count() * 2);\ncount.update(value => value + 1);\nconsole.log(doubled()); // 2",
    takeaway:
      "直接修改 signal 中对象的深层属性不会等同于一次 signal 更新，推荐替换引用。",
    source: "https://angular.dev/guide/signals",
  },
  {
    id: "inputs",
    title: "组件输入与输出",
    group: "组件设计",
    summary:
      "通过 input 接收父级数据，通过 output 发出语义明确的事件，保持组件之间的边界清晰。",
    points: [
      "input.required 声明必须提供的输入。",
      "输出名称描述发生的事情，父组件决定如何更新状态。",
      "组件输出不会像原生 DOM 事件一样自动冒泡。",
    ],
    code: "import { Component, input, output } from '@angular/core';\n\n@Component({\n  selector: 'app-card',\n  standalone: true,\n  template: '<button (click)=\"selected.emit(id())\">选择</button>'\n})\nexport class Card {\n  id = input.required<string>();\n  selected = output<string>();\n}",
    takeaway:
      "input 是只读的输入 signal；状态修改通过 output 交给拥有状态的父组件。",
    source: "https://angular.dev/guide/components/inputs",
  },
  {
    id: "di",
    title: "依赖注入与服务作用域",
    group: "依赖注入",
    summary:
      "服务实例是否共享取决于 provider 所在的注入器，不能只凭服务类判断是否为单例。",
    points: [
      "providedIn: 'root' 通常提供应用级共享实例。",
      "组件 providers 可为组件及其子树提供局部实例。",
      "用 InjectionToken 表达配置等非类依赖，便于替换和测试。",
    ],
    code: "import { Injectable, Component, inject, signal } from '@angular/core';\n\n@Injectable({ providedIn: 'root' })\nexport class DraftStore { draft = signal(''); }\n\n@Component({\n  selector: 'app-editor', standalone: true,\n  providers: [DraftStore], template: '独立草稿'\n})\nexport class Editor { store = inject(DraftStore); }",
    takeaway: "在组件重复提供服务会创建独立状态，应先确定数据共享范围。",
    source: "https://angular.dev/guide/di",
  },
  {
    id: "lifecycle",
    title: "初始化与销毁",
    group: "生命周期",
    summary:
      "组件生命周期串起输入初始化、视图创建和实例销毁，资源的创建与释放应成对出现。",
    points: [
      "第一次 ngOnChanges 发生在 ngOnInit 之前。",
      "访问视图应选择合适的视图生命周期或渲染回调。",
      "DestroyRef.onDestroy 可把清理逻辑放在资源创建附近。",
    ],
    code: "import { DestroyRef, inject } from '@angular/core';\n\n// 在组件的注入上下文中\nconst destroyRef = inject(DestroyRef);\nconst timer = setInterval(() => refresh(), 1000);\ndestroyRef.onDestroy(() => clearInterval(timer));",
    takeaway: "避免在变更检测遍历期间继续修改已检查的绑定值。",
    source: "https://angular.dev/guide/components/lifecycle",
  },
];
const practice: Entry[] = [
  {
    id: "rxjs",
    title: "搜索请求与 RxJS",
    group: "异步请求",
    summary:
      "将输入转换成流，通过去抖、去重和切换订阅，让结果对应最近一次搜索。",
    points: [
      "debounceTime 合并快速输入，distinctUntilChanged 过滤连续重复值。",
      "switchMap 取消对旧内部流的订阅，避免旧响应覆盖新结果。",
      "catchError 放在内部流中可以让外层输入流在一次请求失败后继续工作。",
    ],
    code: "results$ = query.valueChanges.pipe(\n  debounceTime(250),\n  distinctUntilChanged(),\n  switchMap(q => http.get('/api/search', { params: { q } }).pipe(\n    catchError(() => of([]))\n  ))\n);",
    takeaway:
      "取消订阅不等于撤销服务端副作用，写入操作不能盲目使用 switchMap。",
    source: "https://rxjs.dev/api/operators/switchMap",
  },
  {
    id: "reactive-forms",
    title: "响应式表单",
    group: "表单",
    summary:
      "用显式的 FormControl 和 FormGroup 管理表单状态，使校验、组合和测试更直接。",
    points: [
      "nonNullable 可控制 reset 的值与类型行为。",
      "同步校验器返回错误对象或 null；异步校验器需完成。",
      "getRawValue 包含禁用控件，而 value 通常不包含。",
    ],
    code: "import { FormControl, FormGroup, Validators } from '@angular/forms';\n\nconst form = new FormGroup({\n  email: new FormControl('', {\n    nonNullable: true,\n    validators: [Validators.required, Validators.email]\n  })\n});\nform.markAllAsTouched();\nif (form.valid) submit(form.getRawValue());",
    takeaway:
      "模板使用 [formGroup] 或 formControlName 时需要导入 ReactiveFormsModule。",
    source: "https://angular.dev/guide/forms/reactive-forms",
  },
  {
    id: "guards",
    title: "路由与访问控制",
    group: "路由",
    summary:
      "路由守卫控制页面导航，懒加载按需加载功能，接口权限仍由服务端检查。",
    points: [
      "函数式守卫可返回 boolean、UrlTree，或对应的异步结果。",
      "需要重定向时返回 UrlTree，而不是先返回 false 再手动跳转。",
      "CanDeactivate 适合处理未保存表单离开确认。",
    ],
    code: "import { inject } from '@angular/core';\nimport { CanActivateFn, Router } from '@angular/router';\n\nexport const authGuard: CanActivateFn = () => {\n  const auth = inject(AuthService);\n  return auth.isLoggedIn()\n    ? true\n    : inject(Router).createUrlTree(['/login']);\n};",
    takeaway: "隐藏菜单和路由守卫都不构成后端鉴权。",
    source: "https://angular.dev/guide/routing/route-guards",
  },
];
const interview: Entry[] = [
  {
    id: "interview-zoneless",
    title: "为什么第三方回调更新了数据，页面却没有变化？",
    group: "响应机制",
    level: "进阶",
    prompt:
      "一个无 Zone 的 Angular 页面接入第三方 SDK。回调修改普通字段后界面没有更新，请说明通知机制，并设计带销毁清理的修复方案。",
    summary:
      "现代 Angular 可以在不依赖 Zone.js 的情况下调度变更检测，模板读取的 signal 更新会通知视图。",
    points: [
      "signal 保存状态，set 或 update 明确提交更新。",
      "computed 计算纯派生值，依赖变化时失效，并按需重新计算。",
      "第三方 SDK 回调写入 signal；只修改普通字段可能不足以通知视图。",
    ],
    code: "import { signal, computed } from '@angular/core';\n\nconst count = signal(0);\nconst doubled = computed(() => count() * 2);\n// 第三方 SDK 回调也通过 signal 通知视图\nconst unsubscribe = sdk.onChange(value => count.set(value));\ndestroyRef.onDestroy(unsubscribe);",
    takeaway:
      "Angular 22 默认使用无 Zone 变更检测；状态更新与资源清理仍应有明确的所有者。",
    source: "https://angular.dev/guide/zoneless",
    followUps: [
      "signal 更新和 markForCheck 分别适用于什么场景？",
      "组件销毁后如何取消 SDK 监听？",
    ],
    checks: [
      "识别普通字段赋值与更新通知的区别。",
      "说明状态归属和资源清理责任。",
    ],
  },
  {
    id: "interview-binding",
    title: "单向输入为什么仍会修改父组件对象？",
    group: "组件设计",
    level: "进阶",
    prompt:
      "子组件通过 input.required 接收 user，直接修改 user().name 后父组件也变了。请解释引用共享，并设计可取消的编辑表单。",
    summary:
      "只读输入 signal 阻止重新赋值输入本身，但不会深度冻结对象。编辑草稿应与父级状态分离，再通过 output 提交。",
    points: [
      "父级拥有原始状态，子级输出保存意图。",
      "为嵌套编辑建立独立草稿，浅拷贝只能隔离第一层。",
      "输入变化时明确保留或重置草稿的冲突策略。",
    ],
    code: "user = input.required<User>();\nsaved = output<User>();\n\n// 开始编辑时建立独立草稿\nconst draft = structuredClone(this.user());\ndraft.name = 'Lin';\n// 用户确认后输出新值\nthis.saved.emit(draft);",
    takeaway: "单向数据流需要组件遵守状态所有权约定，不是对象自动不可变。",
    source: "https://angular.dev/guide/components/inputs",
    followUps: [
      "浅拷贝能隔离嵌套对象吗？",
      "父级更新输入时如何处理未保存草稿？",
    ],
    checks: ["区分引用共享与输入方向。", "使用独立草稿、输出事件及冲突策略。"],
  },
  {
    id: "interview-injection",
    title: "为什么 inject 在事件回调中抛出 NG0203？",
    group: "依赖注入",
    level: "进阶",
    prompt:
      "服务可以在组件字段初始化时正常 inject，但移动到点击回调后报错。请说明注入上下文的边界，并给出修复方案。",
    summary:
      "inject 需要同步注入上下文，普通事件回调和 await 之后的执行不自动保留上下文。应在字段初始化时取得服务，再在回调中使用。",
    points: [
      "构造和字段初始化处可以注入依赖。",
      "ngOnInit 和普通回调不自动成为注入上下文。",
      "必要时使用 runInInjectionContext，但其上下文只覆盖同步调用栈。",
    ],
    code: "private readonly api = inject(ApiService);\n\nasync save() {\n  // 使用已注入的服务，而不是在这里调用 inject\n  await this.api.save(this.form.getRawValue());\n}",
    takeaway:
      "依赖作用域与注入上下文是不同概念，不能依赖函数参数名自动解析服务。",
    source: "https://angular.dev/guide/di/dependency-injection-context",
    followUps: [
      "InjectionToken 用于什么类型的依赖？",
      "如何为测试替换服务实现？",
    ],
    checks: ["明确 inject 的调用位置。", "将注入和异步业务操作分离。"],
  },
  {
    ...core[0],
    id: "interview-derived",
    title: "为什么派生状态应该用 computed？",
    level: "高级",
    prompt:
      "购物车金额通过 effect 读取商品列表并写入 total signal。请改进设计，并解释派生状态、动态依赖与副作用的区别。",
    followUps: [
      "切换条件分支后依赖会怎样变化？",
      "如何处理 signal 内的对象原地变更？",
    ],
    checks: [
      "使用 computed 表达纯派生关系。",
      "避免重复状态源与 effect 更新环。",
    ],
  },
  {
    id: "interview-onpush",
    title: "OnPush 组件为什么有时刷新、有时不刷新？",
    group: "性能",
    level: "高级",
    prompt:
      "父组件原地修改 user.name，OnPush 子组件没有更新；点击子组件后却出现了新名字。请分析原因和可靠的更新方式。",
    summary:
      "OnPush 在符合触发条件时才检查子树。原地改对象不会产生新的输入引用，而子树事件可能触发检查，让变化此时显现。",
    points: [
      "替换输入对象，明确表达状态变化。",
      "模板依赖的 signal 更新、AsyncPipe 或 markForCheck 也可以通知更新。",
      "不要把一次点击导致的刷新误判成原地修改总是可靠。",
    ],
    code: "// 父组件更新输入对象\nthis.user = { ...this.user, name: 'Lin' };\n\n// 使用 signal 的状态\nthis.userSignal.update(user => ({ ...user, name: 'Lin' }));",
    takeaway: "OnPush 是检查策略，不是让对象自动变成不可变数据。",
    source: "https://angular.dev/best-practices/skipping-subtrees",
    followUps: [
      "AsyncPipe 如何通知视图更新？",
      "列表中哪些场景需要稳定的 track key？",
    ],
    checks: ["说明输入引用与事件触发。", "给出明确、可测试的状态更新方案。"],
  },
  {
    ...core[2],
    id: "interview-scope",
    title: "两个编辑器为什么意外共享了草稿？",
    level: "高级",
    prompt:
      "DraftStore 提供在 root，页面同时打开两个编辑器，输入互相覆盖。如何为每个编辑器隔离状态，同时保留全局登录服务？",
    followUps: ["局部 provider 会影响后代组件吗？", "测试中如何替换某个服务？"],
    checks: [
      "在编辑器边界提供 DraftStore。",
      "区分应用级与组件级服务生命周期。",
    ],
  },
  {
    ...practice[0],
    id: "interview-search",
    title: "如何修复搜索结果被旧请求覆盖？",
    level: "高级",
    prompt:
      "用户先输入 angular，再输入 angular signals。第一个请求较慢，最后覆盖了新结果。请设计支持去抖、错误恢复与销毁清理的搜索流。",
    followUps: [
      "为什么 catchError 的位置会影响后续输入？",
      "保存订单更适合 switchMap、concatMap 还是 exhaustMap？",
    ],
    checks: ["解释切换内部订阅与竞态处理。", "区分读请求取消与写请求副作用。"],
  },
  {
    ...practice[1],
    id: "interview-form",
    title: "动态表单怎样组织校验与提交？",
    level: "高级",
    prompt:
      "一个注册表单包含邮箱异步查重和密码确认。请说明同步、异步、跨字段校验的组织方式，以及 pending 时能否提交。",
    summary:
      "字段级校验放到控件，跨字段校验放到 FormGroup；提交前同时处理 invalid、pending 和重复提交状态。",
    points: [
      "异步校验器返回可完成的 Observable 或 Promise，返回错误对象或 null。",
      "在组级校验器比较两次密码，避免修改其他控件造成递归更新。",
      "提交时展示校验错误，等待 pending 结束，服务端再次检查唯一性。",
    ],
    followUps: [
      "updateOn: 'blur' 对请求次数有什么影响？",
      "禁用字段如何参与提交数据？",
    ],
    checks: ["分层组织校验器。", "识别 pending 与服务端校验竞态。"],
  },
  {
    ...core[3],
    id: "interview-leaks",
    title: "反复进入页面后，为什么请求越来越多？",
    level: "高级",
    prompt:
      "每次进入页面都订阅一个长生命周期事件流，离开页面后仍继续请求。如何定位泄漏并清理订阅、定时器和原生事件？",
    summary:
      "订阅和外部资源的生命周期必须随组件结束，优先使用 AsyncPipe 或 takeUntilDestroyed，其他资源显式注册销毁回调。",
    points: [
      "takeUntilDestroyed 可接收显式 DestroyRef，适用于注入上下文之外的调用。",
      "AsyncPipe 随视图销毁释放订阅；不应重复订阅同一个冷请求流。",
      "原生事件、观察器、定时器和第三方 SDK 监听也要逐一清理。",
    ],
    code: "const destroyRef = inject(DestroyRef);\nstream$.pipe(takeUntilDestroyed(destroyRef))\n  .subscribe(value => this.value = value);\n\nconst handler = () => refresh();\nwindow.addEventListener('resize', handler);\ndestroyRef.onDestroy(() => {\n  window.removeEventListener('resize', handler);\n});",
    followUps: [
      "一次性 HTTP 流和持续事件流有何不同？",
      "如何测试组件销毁后不再接收事件？",
    ],
    checks: ["识别资源所有者与销毁边界。", "理解自动清理工具的适用范围。"],
  },
  {
    ...practice[2],
    id: "interview-guards",
    title: "路由守卫能否保证接口安全？",
    level: "进阶",
    prompt:
      "管理员页面设置了登录守卫，并隐藏了普通用户的菜单。是否已经完成权限控制？请补全一个可靠的设计。",
    followUps: [
      "登录过期后的原始目标地址如何保留？",
      "客户端角色缓存过期如何处理？",
    ],
    checks: [
      "明确服务端是接口鉴权边界。",
      "处理未登录、无权限和权限过期三种情况。",
    ],
  },
  {
    id: "interview-tracking",
    title: "列表重排后为什么输入焦点和状态错位？",
    group: "性能",
    level: "高级",
    prompt:
      "可编辑列表使用索引作为 track key，排序后某些行显示旧输入状态。请解释 DOM 复用与实体身份的关系。",
    summary:
      "列表 key 应表达稳定的实体身份。索引表达当前位置，插入或排序后会把旧视图状态复用给另一个实体。",
    points: [
      "@for 使用 track item.id 表达实体身份。",
      "排序或插入时，索引会把旧视图关联到新实体。",
      "key 应稳定且唯一，不能在每次渲染时随机生成。",
    ],
    code: '@for (item of items(); track item.id) {\n  <app-row [item]="item" />\n}',
    takeaway: "稳定 key 改善正确复用，不会消除所有计算和渲染成本。",
    source: "https://angular.dev/guide/templates/control-flow",
    followUps: [
      "没有服务端 ID 的新建行如何分配 key？",
      "虚拟列表与 track 分别解决什么问题？",
    ],
    checks: [
      "解释身份与位置的差异。",
      "用插入、删除、排序验证表单和焦点状态。",
    ],
  },
  {
    id: "interview-microfrontend",
    title: "如何将 Angular 应用可靠地接入微前端？",
    group: "架构",
    level: "专家",
    prompt:
      "应用既要独立运行，又要在 Wujie 中反复挂载与卸载。请设计启动、路由、资源加载和销毁契约，并处理启动期间快速切走的情况。",
    summary:
      "把应用实例和挂载容器的所有权明确下来，独立运行与微前端共用组件和路由，通过生命周期契约控制创建与销毁。",
    points: [
      "createApplication 后显式指定根组件宿主，避免跨文档选择器定位错误。",
      "HashLocationStrategy 将子路由留在子应用窗口，资源地址指向子应用服务。",
      "异步启动完成前若已卸载，立即销毁迟到的应用实例；DestroyRef 清理页面资源。",
    ],
    code: "let disposed = false;\nlet app;\nconst ready = createApplication(config).then(instance => {\n  if (disposed) return instance.destroy();\n  app = instance;\n  app.bootstrap(App, host);\n});\nfunction unmount() {\n  disposed = true;\n  app?.destroy();\n  host.remove();\n}",
    takeaway: "应用销毁、DOM 移除和外部事件释放都必须覆盖正常离开与异步竞态。",
    source: "https://angular.dev/api/platform-browser/createApplication",
    followUps: [
      "如何防止共享依赖形成新的耦合？",
      "如何验证子应用多次挂载不会泄漏？",
    ],
    checks: [
      "有渐进路线、业务验证和回滚路径。",
      "明确路由与销毁契约的责任归属。",
    ],
  },
];
export const categories: Category[] = [
  {
    id: "basics",
    label: "Angular 基础",
    caption: "理解应用的运行方式",
    description: "从独立组件、模板到响应式状态，梳理现代 Angular 的运行方式。",
    entries: basics,
  },
  {
    id: "angular",
    label: "Angular 核心",
    caption: "建立现代 Angular 心智模型",
    description:
      "认识现代 Angular 的 Signals、组件 API、服务作用域与生命周期。",
    entries: core,
  },
  {
    id: "practice",
    label: "工程实践",
    caption: "把知识放进真实场景",
    description: "用请求流、表单和路由，把零散知识连接成可维护的应用。",
    entries: practice,
  },
  {
    id: "interview",
    label: "Angular 面试题",
    caption: "从原理到方案设计",
    description:
      "先独立思考，再展开答案。覆盖现代 Angular 的响应机制、组件、工程与微前端设计。",
    entries: interview,
  },
];
export function filterEntries(
  entries: Entry[],
  query: string,
  group: string,
  level: string
): Entry[] {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return entries.filter((entry) => {
    const text = [
      entry.title,
      entry.summary,
      entry.prompt,
      entry.code,
      ...entry.points,
    ]
      .join(" ")
      .toLocaleLowerCase();
    return (
      (group === "全部" || entry.group === group) &&
      (level === "全部难度" || entry.level === level) &&
      terms.every((term) => text.includes(term))
    );
  });
}
