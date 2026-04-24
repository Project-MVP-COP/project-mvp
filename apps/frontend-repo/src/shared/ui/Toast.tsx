import { useAppStore } from "../../app/store/useAppStore";
import { useEffect } from "react";

export function Toast() {
  const { toast, hideToast } = useAppStore();

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, hideToast]);

  if (!toast) return null;

  const backgroundColor = {
    success: "#4caf50",
    error: "#f44336",
    info: "#2196f3",
  }[toast.type];

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        padding: "1rem 2rem",
        backgroundColor,
        color: "white",
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
        zIndex: 1000,
        transition: "all 0.3s ease",
      }}
    >
      {toast.message}
    </div>
  );
}
