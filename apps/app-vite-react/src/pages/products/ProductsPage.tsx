import "./ProductsPage.css";

export function ProductsPage() {
  return (
    <section className="section-page">
      <p className="eyebrow">
        <span /> 我们的产品
      </p>
      <div className="page-heading-row">
        <h1>
          为日常创造
          <br />
          <span className="accent-text">一点新可能。</span>
        </h1>
        <p className="page-lede">认真打磨的小工具，让灵感和工作都更顺手。</p>
      </div>
      <div className="product-grid">
        <article className="product-card product-card-lilac">
          <div className="product-topline">
            <span>01 / CREATE</span>
            <span>↗</span>
          </div>
          <div className="product-icon icon-grid">
            <i />
            <i />
            <i />
            <i />
          </div>
          <h2>灵感盒子</h2>
          <p>随手收集、整理和连接灵感，让好点子有迹可循。</p>
          <span className="product-status">即将上线</span>
        </article>
        <article className="product-card product-card-mint">
          <div className="product-topline">
            <span>02 / FOCUS</span>
            <span>↗</span>
          </div>
          <div className="product-icon icon-clock">◷</div>
          <h2>慢一点</h2>
          <p>一款轻量的专注计时器，帮你把注意力还给眼前的事。</p>
          <span className="product-status">公开测试中</span>
        </article>
        <article className="product-card product-card-peach">
          <div className="product-topline">
            <span>03 / CONNECT</span>
            <span>↗</span>
          </div>
          <div className="product-icon icon-spark">✳</div>
          <h2>一起做</h2>
          <p>把想法变成一个共同的小目标，和伙伴一起稳稳向前。</p>
          <span className="product-status">持续探索</span>
        </article>
      </div>
      <p className="page-footnote">
        每个产品都从一个真实的小问题开始。我们会持续倾听，也持续迭代。
      </p>
    </section>
  );
}
