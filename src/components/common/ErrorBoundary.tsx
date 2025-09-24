import React from 'react';

interface ErrorBoundaryProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Jump modal render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-6 border border-destructive/30 rounded-lg bg-destructive/5 text-center">
          <h3 className="text-lg font-semibold mb-2">We hit a snag rendering this jump</h3>
          <p className="text-sm text-muted-foreground mb-4">Open it in JumpinAI Studio or try again.</p>
          <a href="/jumpinai-studio" className="inline-flex items-center justify-center rounded-2xl border border-primary/30 px-3 py-2 text-sm hover:bg-primary/10 transition-colors">Open in JumpinAI Studio</a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
