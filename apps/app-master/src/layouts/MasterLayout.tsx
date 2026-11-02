import { Layout, Menu, Tag, Typography } from "antd";
import { Link, Outlet, useLocation } from "react-router";
import { microApps } from "@/micro/apps";


export function MasterLayout() {
  const location = useLocation();
  const selected = microApps.find(
    (app) =>
      location.pathname === `/apps/${app.name}` ||
      location.pathname.startsWith(`/apps/${app.name}/`)
  );
  return (
    <Layout className="min-h-screen">
      <Layout.Sider
        className="master-sidebar"
        breakpoint="lg"
        collapsedWidth={0}
        width={200}
      >
        <div className="px-6 py-7 text-xl font-semibold tracking-wide text-white">
          微前端工作台
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[
            selected?.name ?? (location.pathname === "/" ? "home" : ""),
          ]}
          items={[
            { key: "home", label: <Link to="/">应用概览</Link> },
            ...microApps.map((app) => ({
              key: app.name,
              label: <div className="flex justify-between">
                <Link to={`/apps/${app.name}`} className="relative">{app.title}</Link>
                <Link to={`${app.entry}`} target="__blank" className="relative"> &gt;</Link>
              </div>,
            })),
          ]}
        />
      </Layout.Sider>
      <div className="min-w-0 flex-auto">
         <Outlet />
      </div>
    </Layout>
  );
}
