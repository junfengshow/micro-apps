// 加载服务未启动或断网时及时结束请求，防止切换队列一直等待资源。
export function appFetch(signal?: AbortSignal): typeof fetch {
  return (input, init) =>
    fetch(input, {
      ...init,
      // 任一信号触发即终止：15 秒超时、页面卸载，或调用方自己的取消信号。
      signal: AbortSignal.any([
        AbortSignal.timeout(15000),
        ...(signal ? [signal] : []),
        ...(init?.signal ? [init.signal] : []),
      ]),
    });
}
