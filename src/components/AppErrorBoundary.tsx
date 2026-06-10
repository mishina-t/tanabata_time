import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { failed: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Application error", error, info);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="fatal-error">
        <h1>画面を読み込めませんでした</h1>
        <p>保存済みの予定は消えていません。ページを再読み込みしてください。</p>
        <button onClick={() => window.location.reload()}>再読み込み</button>
      </main>
    );
  }
}
