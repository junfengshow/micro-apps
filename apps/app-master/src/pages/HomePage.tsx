import { Button, Card, Empty, Typography } from "antd";
import { Link } from "react-router";
import { microApps } from "@/micro/apps";

export function HomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <Typography.Title level={2}>应用概览</Typography.Title>
        <Typography.Paragraph type="secondary">
          已接入 {microApps.length} 个应用
        </Typography.Paragraph>
      </div>
      {microApps.length === 0 ? (
        <Card>
          <Empty description="暂无接入应用" />
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {microApps.map((app) => (
            <Card key={app.name} title={app.title}>
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
