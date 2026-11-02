import { Link, NavLink, Outlet } from "react-router";
import { navigation } from "../router/navigation";
import "./AppLayout.css";

export function AppLayout() {
  return (
    <div className="site-shell">
      <header className="topbar">
        <Link aria-label="Demo Studio 首页" className="brand" to="/">
          <span className="brand-mark">d.</span>
          <span>demo studio</span>
        </Link>
        <nav aria-label="主导航" className="main-nav">
          {navigation.map((item) => (
            <NavLink
              end={item.end}
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "nav-link nav-link-active" : "nav-link"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="topbar-actions">
          <a className="topbar-cta" href="mailto:hello@example.com">
            预约体验 <span aria-hidden="true">↗</span>
          </a>
          <NavLink
            className="topbar-cta"
            to="/react"
            rel="noreferrer"
          >
            React 手册 <span aria-hidden="true">↗</span>
          </NavLink>
        </div>
      </header>
      <main className="page-content">
        <Outlet />
      </main>
      <footer className="footer">
        <Link className="brand footer-brand" to="/">
          <span className="brand-mark">d.</span>
          <span>demo studio</span>
        </Link>
        <span>把复杂的事，做得简单一点。</span>
        <span>© 2026 Demo Studio</span>
      </footer>
    </div>
  );
}
