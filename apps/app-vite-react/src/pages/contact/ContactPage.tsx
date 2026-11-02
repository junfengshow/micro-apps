import { useState, type FormEvent } from "react";
import "./ContactPage.css";

export function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="section-page contact-page">
      <p className="eyebrow">
        <span /> 联系我们
      </p>
      <div className="page-heading-row">
        <h1>
          下一件有趣的事，
          <br />
          <span className="accent-text">从这里开始。</span>
        </h1>
        <p className="page-lede">
          有想法、有问题，或者只是想打个招呼？我们都很乐意听。
        </p>
      </div>
      <div className="contact-layout">
        <div className="contact-details">
          <span className="mini-label">LET'S MAKE SOMETHING GOOD</span>
          <h2>
            给我们写信，
            <br />
            我们会认真回复。
          </h2>
          <a className="email-link" href="mailto:hello@example.com">
            hello@example.com <span>↗</span>
          </a>
          <div className="contact-hours">
            <span className="online-dot" /> 通常会在两个工作日内回复
          </div>
          <div className="contact-decoration">✳</div>
        </div>
        <form className="contact-form" onSubmit={handleSubmit}>
          <label>
            怎么称呼你？
            <input
              autoComplete="name"
              name="name"
              placeholder="你的名字"
              required
            />
          </label>
          <label>
            联系邮箱
            <input
              autoComplete="email"
              name="email"
              placeholder="name@example.com"
              required
              type="email"
            />
          </label>
          <label>
            想聊些什么？
            <textarea
              name="message"
              placeholder="简单说说你的想法……"
              required
              rows={4}
            />
          </label>
          <button className="button button-dark form-submit" type="submit">
            发送消息 <span aria-hidden="true">→</span>
          </button>
          {submitted && (
            <p className="form-success" role="status">
              谢谢你！这是一份演示表单，消息没有发送到服务器。
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
