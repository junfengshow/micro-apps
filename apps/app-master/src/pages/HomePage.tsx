import { Button, Card, Empty, Tag, Typography } from "antd";
import { Link } from "react-router";
import { microApps } from "@/micro/apps";

export function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Typography.Title level={2}>应用概览</Typography.Title>
        <Typography.Paragraph type="secondary">
          从一个工作台访问各业务应用。
        </Typography.Paragraph>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card title="接入模式">
          <Tag color="blue">
            {__MICRO_ENGINE__ === "all"
              ? "四种引擎 · 运行时切换"
              : __MICRO_ENGINE__}
          </Tag>
        </Card>
        <Card title="已接入应用">
          <span className="text-2xl font-semibold">{microApps.length}</span>
        </Card>
      </div>
      {microApps.length === 0 ? (
        <Card>
          <Empty description="暂无接入应用" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {microApps.map((app) => (
            <Card key={app.name} title={app.title}>
              <p>
                <Tag>{app.engine}</Tag>
              </p>
              <Link to={`/apps/${app.name}`}>
                <Button type="primary">打开应用</Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
