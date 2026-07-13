import React from "react";
import { AlertCircle } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px", maxWidth: "800px", margin: "0 auto", background: "#fee2e2", color: "#991b1b", borderRadius: "10px", marginTop: "40px", fontFamily: "monospace" }}>
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 0 20px" }}><AlertCircle /> App Crashed!</h2>
          <p style={{ fontWeight: "bold", fontSize: "16px", marginBottom: "10px" }}>{this.state.error && this.state.error.toString()}</p>
          <div style={{ background: "#fff", padding: "16px", borderRadius: "8px", overflowX: "auto", border: "1px solid #f87171" }}>
            <pre style={{ margin: 0, fontSize: "12px", whiteSpace: "pre-wrap" }}>
              {this.state.errorInfo?.componentStack}
            </pre>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
