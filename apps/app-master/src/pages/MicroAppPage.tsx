import { useParams } from "react-router";
import { microApps } from "@/micro/apps";
import { MicroAppView } from "@/micro/MicroAppView";
import { NotFoundPage } from "./NotFoundPage";

export function MicroAppPage() {
  const { name } = useParams();
  const app = microApps.find((item) => item.name === name);
  // 深层路由变更时保留实例，只有切换应用才重建容器。
  return app ? <MicroAppView key={app.name} app={app} /> : <NotFoundPage />;
}
