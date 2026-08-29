import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  label: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/** Isolates a panel so one render failure cannot take down the whole app. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`Panel "${this.props.label}" failed:`, error, info.componentStack);
  }

  private reset = (): void => this.setState({ error: null });

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div className="error-boundary" role="alert">
          <p>The {this.props.label} panel hit an error.</p>
          <button type="button" onClick={this.reset}>Reset panel</button>
        </div>
      );
    }
    return this.props.children;
  }
}
