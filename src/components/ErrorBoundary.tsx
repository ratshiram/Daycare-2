"use client"

import React from 'react';

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary p-8 bg-red-50 text-red-800 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Oops! Something went wrong.</h2>
          <p>Please try refreshing the page. If the problem persists, check the console for more details.</p>
          {this.state.error && <pre className="mt-4 p-2 bg-red-100 rounded text-sm overflow-auto">{this.state.error.toString()}</pre>}
          {this.state.errorInfo && <pre className="mt-2 p-2 bg-red-100 rounded text-sm overflow-auto">{this.state.errorInfo.componentStack}</pre>}
        </div>
      );
    }
    return this.props.children;
  }
}
