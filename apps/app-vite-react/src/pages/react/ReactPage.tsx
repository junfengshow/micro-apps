import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { Link, useSearchParams } from "react-router";
import { categories, searchEntries } from "./content";
import { EventDemo, FormDemo, StateDemo } from "./demos";
import type { KnowledgeEntry } from "./types";
import "./ReactPage.css";
import DemoContainer from './demos/DemoContainer'

function CodeExample({
  code,
  label = "使用示例",
}: {
  code: string;
  label?: string;
}) {
  const [message, setMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(code);
      setMessage("已复制");
    } catch {
      setMessage("复制不可用，请手动选择代码");
    }
    timer.current = setTimeout(() => setMessage(""), 2500);
  }

  return (
    <div className="rh-code">
      <div className="rh-code-bar">
        <span>
          <i /> {label} <b>JSX</b>
        </span>
        <button type="button" onClick={copy}>
          复制代码
        </button>
      </div>
      <pre tabIndex={0} aria-label={`${label} JSX`}>
        <code>{code}</code>
      </pre>
      <span className="rh-copy-status" role="status">
        {message}
      </span>
    </div>
  );
}

function EntryBody({
  entry,
  interview = false,
}: {
  entry: KnowledgeEntry;
  interview?: boolean;
}) {

  return (
    <div className="rh-entry-body">
      <div className="rh-entry-explanation">
        {interview && <span className="rh-kicker">参考答案</span>}
        <p className="rh-entry-summary">{entry.summary}</p>
        <ul>
          {entry.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <div className="rh-takeaway">
          <span>{interview ? "方案边界" : "注意事项"}</span>
          <p>{entry.takeaway}</p>
        </div>
        <a
          className="rh-source"
          href={entry.source}
          target="_blank"
          rel="noreferrer"
        >
          阅读官方文档 <span aria-hidden="true">↗</span>
        </a>
        <DemoContainer Cmp={entry.demo} />
      </div>
      <CodeExample
        code={entry.code}
        label={interview ? "参考代码 · 关键片段" : "使用示例"}
      />
    </div>
  );
}

function EntryCard({
  entry,
  index,
  interview,
}: {
  entry: KnowledgeEntry;
  index: number;
  interview: boolean;
}) {
  const heading = (
    <>
      <span className="rh-entry-number">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="rh-entry-title">{entry.title}</span>
      <span className="rh-tag">{entry.group}</span>
    </>
  );
  return interview && entry.interview ? (
    <article
      className="rh-entry rh-question"
      id={`rh-entry-${entry.id}`}
      aria-labelledby={`rh-title-${entry.id}`}
    >
      <h3 className="rh-entry-header" id={`rh-title-${entry.id}`}>
        {heading}
        <span className="rh-difficulty" data-level={entry.interview.difficulty}>
          {entry.interview.difficulty}
        </span>
      </h3>
      <div className="rh-question-prompt">
        <span className="rh-question-kind">{entry.interview.kind}</span>
        <p>{entry.interview.prompt}</p>
        {entry.interview.questionCode && (
          <CodeExample code={entry.interview.questionCode} label="待分析代码" />
        )}
      </div>
      <details className="rh-answer">
        <summary>
          参考答案与分析{" "}
          <span className="rh-expand" aria-hidden="true">
            +
          </span>
        </summary>
        <EntryBody entry={entry} interview />
        <div className="rh-review-sections">
          <section>
            <h4>进一步追问</h4>
            <ol>
              {entry.interview.followUps.map((question) => (
                <li key={question}>{question}</li>
              ))}
            </ol>
          </section>
          <section>
            <h4>评价要点</h4>
            <ul>
              {entry.interview.checks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </section>
        </div>
      </details>
    </article>
  ) : (
    <article
      className="rh-entry"
      id={`rh-entry-${entry.id}`}
      aria-labelledby={`rh-title-${entry.id}`}
    >
      <h3 className="rh-entry-header" id={`rh-title-${entry.id}`}>
        {heading}
      </h3>
      <EntryBody entry={entry} />
    </article>
  );
}

export function ReactPage() {
  const [params, setParams] = useSearchParams();
  const category =
    categories.find((item) => item.id === params.get("tab")) || categories[0];
  const query = params.get("q") || "";
  const groups = [
    "全部",
    ...new Set(category.entries.map((entry) => entry.group)),
  ];
  const group = groups.includes(params.get("group") || "")
    ? params.get("group")!
    : "全部";
  const levels = ["全部难度", "进阶", "高级", "专家"];
  const level = levels.includes(params.get("level") || "")
    ? params.get("level")!
    : "全部难度";
  const entries = searchEntries(category.entries, query, group).filter(
    (entry) =>
      category.id !== "interview" ||
      level === "全部难度" ||
      entry.interview?.difficulty === level
  );
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const searchInput = useRef<HTMLInputElement>(null);
  const interview = category.id === "interview";

  useEffect(() => {
    const previous = document.title;
    document.title = "React 知识手册";
    return () => {
      document.title = previous;
    };
  }, []);

  useEffect(() => {
    function focusSearch(event: globalThis.KeyboardEvent) {
      const target = event.target;
      if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey)
        return;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      )
        return;
      event.preventDefault();
      searchInput.current?.focus();
    }
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  function selectCategory(id: string) {
    setParams({ tab: id });
    document.getElementById("rh-panel")?.scrollIntoView({ block: "start" });
  }

  function navigateTabs(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number
  ) {
    let next = index;
    if (event.key === "ArrowDown" || event.key === "ArrowRight")
      next = (index + 1) % categories.length;
    else if (event.key === "ArrowUp" || event.key === "ArrowLeft")
      next = (index + categories.length - 1) % categories.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = categories.length - 1;
    else return;
    event.preventDefault();
    selectCategory(categories[next].id);
    tabs.current[next]?.focus();
  }

  function updateFilter(key: string, value: string) {
    const next = new URLSearchParams(params);
    next.set("tab", category.id);
    if (value && value !== "全部" && value !== "全部难度") next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  }

  return (
    <div className="react-handbook">
      <a className="rh-skip" href="#rh-main">
        跳至学习内容
      </a>
      <aside className="rh-sidebar">
        <Link to="/react" className="rh-brand" aria-label="React 知识手册首页">
          <span className="rh-atom" aria-hidden="true">
            ⚛
          </span>
          <span>
            React<span className="rh-brand-sub">知识手册</span>
          </span>
        </Link>
        <p className="rh-nav-caption">内容分类</p>
        <nav aria-label="知识分类">
          <div
            className="rh-tabs"
            role="tablist"
            aria-label="React 知识分类"
            aria-orientation="vertical"
          >
            {categories.map((item, index) => (
              <button
                key={item.id}
                ref={(element) => {
                  tabs.current[index] = element;
                }}
                id={`rh-tab-${item.id}`}
                role="tab"
                type="button"
                aria-selected={item.id === category.id}
                aria-controls="rh-panel"
                tabIndex={item.id === category.id ? 0 : -1}
                onClick={() => selectCategory(item.id)}
                onKeyDown={(event) => navigateTabs(event, index)}
              >
                <span className="rh-tab-number">{item.number}</span>
                <span>
                  {item.label}
                  <small>{item.caption}</small>
                </span>
                <span className="rh-tab-count">{item.entries.length}</span>
              </button>
            ))}
          </div>
        </nav>
        <div className="rh-sidebar-bottom">
          <span className="rh-status-dot" /> 稳定 API · React 19.2+
          <Link to="/">← 返回 Demo Studio</Link>
        </div>
      </aside>

      <main className="rh-main" id="rh-main">
        <header className="rh-topbar">
          <h1>React 知识手册</h1>
          <span className="rh-version">React {__REACT_VERSION__}</span>
        </header>
        <section
          id="rh-panel"
          className="rh-panel"
          role="tabpanel"
          aria-labelledby={`rh-tab-${category.id}`}
          tabIndex={0}
        >
          <div className="rh-section-heading">
            <div>
              <h2>{category.label}</h2>
              <p>{category.description}</p>
            </div>
          </div>
          <div className="rh-tools">
            <label className="rh-search">
              <span aria-hidden="true">⌕</span>
              <input
                ref={searchInput}
                type="search"
                aria-keyshortcuts="/"
                aria-label={`搜索${category.label}`}
                placeholder={`搜索${category.label}中的概念、代码…`}
                value={query}
                onChange={(event) => updateFilter("q", event.target.value)}
              />
              <kbd>/</kbd>
            </label>
            {interview && (
              <label className="rh-level-filter">
                <span>难度</span>
                <select
                  aria-label="筛选面试题难度"
                  value={level}
                  onChange={(event) =>
                    updateFilter("level", event.target.value)
                  }
                >
                  {levels.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            )}
            <span className="rh-result-count" role="status">
              {entries.length} / {category.entries.length} 个条目
            </span>
          </div>
          <div className="rh-filters" aria-label="内容分组">
            {groups.map((item) => (
              <button
                key={item}
                type="button"
                aria-pressed={group === item}
                onClick={() => updateFilter("group", item)}
              >
                {item}
              </button>
            ))}
          </div>

          {!query.trim() && group === "全部" && (
            <div className="rh-live-demo">
              {category.id === "foundations" ? (
                <>
                  <StateDemo />
                  <StepClock />
                </>
              ) : category.id === "events" ? (
                <EventDemo />
              ) : category.id === "hooks" ? (
                <FormDemo />
              ) : null}
            </div>
          )}

          {entries.length ? (
            <div className="rh-reading-grid">
              <div className="rh-entries">
                {entries.map((entry) => (
                  <EntryCard
                    key={entry.id}
                    entry={entry}
                    index={category.entries.indexOf(entry)}
                    interview={interview}
                  />
                ))}
              </div>
              <aside className="rh-outline" aria-label="当前分类目录">
                <span className="rh-kicker">本页目录</span>
                <nav>
                  {entries.map((entry) => (
                    <a key={entry.id} href={`#rh-entry-${entry.id}`}>
                      {entry.title}
                    </a>
                  ))}
                </nav>
                <p>
                  {interview
                    ? "先完成题设，再展开答案。代码为方案关键片段，按题目上下文使用。"
                    : "所有示例均为独立 JSX，可复制到 React 19.2+ 项目中练习。"}
                </p>
              </aside>
            </div>
          ) : (
            <div className="rh-empty">
              <span aria-hidden="true">⌕</span>
              <h3>暂时没有匹配的内容</h3>
              <p>试试 Hook 名称或关键词，例如“状态”“清理”“表单”。</p>
              <button
                type="button"
                onClick={() =>
                  setParams({ tab: category.id }, { replace: true })
                }
              >
                清除搜索与筛选
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
