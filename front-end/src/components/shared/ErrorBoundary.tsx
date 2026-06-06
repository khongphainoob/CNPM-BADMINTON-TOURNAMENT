import React, { Component, ErrorInfo, ReactNode } from 'react';
import Icon from './Icon';
import { Button } from '../ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-[var(--paper)] text-[var(--ink)] p-6">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-6">
            <Icon name="alert-triangle" size={32} />
          </div>
          <h1 className="font-serif font-bold text-2xl mb-2">Đã xảy ra lỗi hệ thống</h1>
          <p className="text-[var(--ink-2)] text-center max-w-md mb-8">
            Chúng tôi xin lỗi vì sự bất tiện này. Một lỗi không mong muốn đã xảy ra trong quá trình hiển thị.
          </p>
          {this.state.error && (
            <div className="bg-[var(--paper-2)] p-4 rounded-md mb-8 w-full max-w-xl overflow-auto text-xs font-mono text-[var(--ink-3)] border border-[var(--line)]">
              {this.state.error.toString()}
            </div>
          )}
          <Button onClick={() => window.location.reload()}>
            <Icon name="refresh-cw" size={16} className="mr-2" />
            Tải lại trang
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
