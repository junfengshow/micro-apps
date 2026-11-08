import { lazy, Suspense } from "react";

// 实际项目通常写 lazy(() => import('./Article'))。
// 这里使用本地异步模块，便于完整运行。
const Article = lazy(async () => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  return { default: () => <p>文章已准备好。</p> };
});

export default function Reader() {
  return (
    <Suspense fallback={<p>加载文章中…</p>}>
      <Article />
    </Suspense>
  );
}
