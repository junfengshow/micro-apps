import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack);
  }
  render() {
    return this.state.failed ? (
      <p role="alert">这部分内容暂时无法显示。</p>
    ) : (
      this.props.children
    );
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <p>受保护的内容</p>
    </ErrorBoundary>
  );
}
