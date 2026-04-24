import { isRouteErrorResponse, useRouteError } from "react-router";
import type { ProblemDetail } from "../model/problemDetail";

export function ErrorBoundary() {
  const error = useRouteError();

  let message = "An unexpected error occurred.";

  if (isRouteErrorResponse(error)) {
    message = error.statusText || error.data;
  } else if (error && typeof error === "object" && "detail" in error) {
    message = (error as ProblemDetail).detail || message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div style={{ padding: "2rem", color: "#d32f2f", border: "1px solid #d32f2f", borderRadius: "8px", margin: "2rem", backgroundColor: "#fff5f5" }}>
      <h2 style={{ marginTop: 0 }}>Oops! Something went wrong.</h2>
      <p>{message}</p>
    </div>
  );
}
