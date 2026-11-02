import { Link } from "react-router";
import "./HomePage.css";

export function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">
            <span /> 数字体验工作室
          </p>
          <h1>
            好的想法，
            <br />
            值得<span className="accent-text">被看见。</span>
          </h1>
          <p className="hero-description">
            我们用清晰的设计与可靠的技术，把每一个想法变成触手可及的体验。
          </p>
          <div className="hero-actions">
            <Link className="button button-dark" to="/products">
              探索我们的产品 <span aria-hidden="true">→</span>
            </Link>
            <Link className="text-link" to="/about">
              认识 Demo Studio
            </Link>
          </div>
          <div className="hero-note">
            <div className="avatar-stack" aria-hidden="true">
              <span>林</span>
              <span>陈</span>
              <span>周</span>
            </div>
            <span>一支认真解决问题的小团队</span>
          </div>
        </div>
        <div className="hero-art" aria-label="创意工作空间插画">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-card card-back">
            <span className="mini-label">IDEA / 01</span>
            <div className="mini-lines">
              <i />
              <i />
              <i />
            </div>
          </div>
          <div className="art-card card-front">
            <span className="card-sparkle">✳</span>
            <span className="mini-label">MAKE IT REAL</span>
            <strong>
              从灵感
              <br />
              到日常。
            </strong>
            <span className="card-arrow">↗</span>
          </div>
          <div className="art-sticker">
            让好点子
            <br />
            发生 ✦
          </div>
          <div className="art-caption">小步快跑 · 持续创造</div>
        </div>
      </section>
      <section className="stat-strip" aria-label="工作室数据">
        <div>
          <strong>
            12<span>+</span>
          </strong>
          <small>上线项目</small>
        </div>
        <div>
          <strong>
            4<span>年</span>
          </strong>
          <small>持续探索</small>
        </div>
        <div>
          <strong>
            100<span>%</span>
          </strong>
          <small>认真对待每个细节</small>
        </div>
        <p>
          从一个小小的灵感开始，
          <br />
          让改变自然发生。
        </p>
      </section>
      <section className="section-block home-intro">
        <p className="eyebrow">从这里开始</p>
        <h2>
          小团队，也能做出
          <br />
          有分量的作品。
        </h2>
        <p className="section-description">
          看看我们正在做什么，或了解如何把你的下一个想法一起变成现实。
        </p>
        <div className="quick-links">
          <Link to="/solutions">
            <span>01</span>
            <strong>我们如何解决问题</strong>
            <i>↗</i>
          </Link>
          <Link to="/contact">
            <span>02</span>
            <strong>聊聊你的想法</strong>
            <i>↗</i>
          </Link>
        </div>
      </section>
    </>
  );
}
