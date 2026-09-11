/**
 * (c) 2026, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import { Component, ErrorInfo, ReactNode } from "react";

export interface ErrorBoundaryProps {
  /**
   * Called once for each error caught. Report the error here. Returning a
   * string (typically the Sentry event id) passes it to the fallback as the
   * reference to show the user.
   */
  onError?: (error: unknown, errorInfo: ErrorInfo) => string | undefined | void;
  /**
   * Rendered in place of the children after an error. The reference is
   * whatever `onError` returned, so it is undefined on the first render of
   * the fallback and filled in on the next.
   */
  fallback: (error: unknown, reference: string | undefined) => ReactNode;
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: unknown;
  reference?: string;
}

/**
 * Catches render errors below it. Pair it with react-router's
 * `errorElement`, which also catches loader errors but not from inside a
 * boundary like this one; both can render `UnexpectedErrorPage`.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    const reference = this.props.onError?.(error, errorInfo);
    if (reference) {
      this.setState({ reference });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback(this.state.error, this.state.reference);
    }
    return this.props.children;
  }
}
