import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error | undefined;
  errorInfo?: ErrorInfo | undefined;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static override getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: undefined };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-b from-red-50 to-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-red-700 dark:text-red-400">
                앗! 문제가 발생했습니다
              </h2>
              <p className="text-sm text-muted-foreground">
                CarFin AI 시스템에서 예상치 못한 오류가 발생했습니다.
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/20 rounded-lg p-3 text-left">
              <details className="text-xs">
                <summary className="cursor-pointer text-red-600 dark:text-red-400 font-medium">
                  기술적 세부사항 보기
                </summary>
                <div className="mt-2 space-y-1">
                  <p className="font-mono bg-red-100 dark:bg-red-950/40 p-2 rounded text-red-800 dark:text-red-300">
                    {this.state.error?.message || '알 수 없는 오류'}
                  </p>
                  {this.state.error?.stack && (
                    <pre className="text-xs overflow-auto max-h-32 bg-red-100 dark:bg-red-950/40 p-2 rounded text-red-700 dark:text-red-400">
                      {this.state.error.stack}
                    </pre>
                  )}
                </div>
              </details>
            </div>

            <div className="flex gap-3">
              <Button onClick={this.handleRetry} variant="outline" className="flex-1 gap-2">
                <RefreshCw className="w-4 h-4" />
                다시 시도
              </Button>
              <Button onClick={this.handleReload} className="flex-1 gap-2 bg-red-600 hover:bg-red-700">
                <RefreshCw className="w-4 h-4" />
                페이지 새로고침
              </Button>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                문제가 지속되면{' '}
                <a
                  href="mailto:support@carfin.ai"
                  className="text-primary hover:underline"
                >
                  support@carfin.ai
                </a>
                로 문의해주세요.
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;