import "./SolutionsPage.css";

export function SolutionsPage() {
  const steps = [
    {
      number: "01",
      title: "一起发现问题",
      text: "先听清楚，再定义什么才是真正值得解决的事。",
    },
    {
      number: "02",
      title: "做出可触摸的想法",
      text: "用原型快速验证，让讨论建立在真实体验之上。",
    },
    {
      number: "03",
      title: "持续交付价值",
      text: "从小步上线开始，观察反馈，让产品在使用中变好。",
    },
  ];

  return (
    <section className="section-page solutions-page">
      <p className="eyebrow">
        <span /> 我们的方式
      </p>
      <div className="page-heading-row">
        <h1>
          从问题出发，
          <br />
          让答案<span className="accent-text">落地。</span>
        </h1>
        <p className="page-lede">不追赶潮流，只专注于找到适合你的那条路。</p>
      </div>
      <div className="solution-list">
        {steps.map((step) => (
          <article className="solution-step" key={step.number}>
            <span className="step-number">{step.number}</span>
            <h2>{step.title}</h2>
            <p>{step.text}</p>
            <span className="step-arrow">↗</span>
          </article>
        ))}
      </div>
      <div className="quote-card">
        <span className="quote-mark">“</span>
        <p>最好的解决方案，往往从一个好问题开始。</p>
        <span>Demo Studio 的工作信条</span>
      </div>
    </section>
  );
}
