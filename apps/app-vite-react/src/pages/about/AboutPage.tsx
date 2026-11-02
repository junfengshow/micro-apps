import { Link } from "react-router";
import "./AboutPage.css";

export function AboutPage() {
  return (
    <section className="section-page about-page">
      <p className="eyebrow">
        <span /> 关于我们
      </p>
      <div className="page-heading-row">
        <h1>
          保持好奇，
          <br />
          <span className="accent-text">一起创造。</span>
        </h1>
        <p className="page-lede">
          我们是一群喜欢把复杂事情讲清楚、做简单的人。
        </p>
      </div>
      <div className="about-story">
        <div className="story-art">
          <div className="story-sun">☼</div>
          <div className="story-note note-one">stay curious</div>
          <div className="story-note note-two">做点有意思的事</div>
          <div className="story-circle" />
        </div>
        <div className="story-copy">
          <span className="mini-label">A SMALL STUDIO WITH BIG CURIOSITY</span>
          <h2>
            让好体验，
            <br />
            成为生活的一部分。
          </h2>
          <p>
            Demo Studio 始于 2022
            年。我们相信，技术不该增加距离，设计也不只是装饰。好的数字产品能让事情更清楚，让人与人之间的协作更轻松。
          </p>
          <p>
            现在，我们专注于打造贴近日常的小产品，也和志同道合的伙伴一起探索新的可能。
          </p>
          <Link className="text-link" to="/contact">
            来认识一下 <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
      <div className="values-row">
        <div>
          <span>01</span>
          <strong>保持好奇</strong>
          <p>多问一个为什么。</p>
        </div>
        <div>
          <span>02</span>
          <strong>认真倾听</strong>
          <p>先理解，再行动。</p>
        </div>
        <div>
          <span>03</span>
          <strong>持续打磨</strong>
          <p>每次都比上次好一点。</p>
        </div>
      </div>
    </section>
  );
}
