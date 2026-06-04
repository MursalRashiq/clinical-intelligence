import React from "react";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info" | "warning";
  isLoading?: boolean;
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const colors = {
    danger: {
      bg: "#fef2f2",
      text: "#991b1b",
      icon: "error",
      button: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      shadow: "rgba(239, 68, 68, 0.2)",
    },
    warning: {
      bg: "#fffbeb",
      text: "#92400e",
      icon: "warning",
      button: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
      shadow: "rgba(245, 158, 11, 0.2)",
    },
    info: {
      bg: "#eff6ff",
      text: "#1e40af",
      icon: "info",
      button: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      shadow: "rgba(59, 130, 246, 0.2)",
    },
  }[type];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        animation: "modalFadeIn 0.2s ease-out",
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(15, 23, 42, 0.3)",
          backdropFilter: "blur(8px)",
          animation: "backdropFadeIn 0.3s ease-out",
        }}
      />

      {/* Modal Content */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          background: "white",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
          animation: "modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <style>{`
          @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes backdropFadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes modalSlideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
          .modal-btn {
            padding: 12px 20px;
            border-radius: 14px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .modal-btn:active { transform: scale(0.96); }
          .modal-btn-cancel {
            background: #f1f5f9;
            color: #475569;
          }
          .modal-btn-cancel:hover { background: #e2e8f0; color: #1e293b; }
          .modal-btn-confirm {
            background: ${colors.button};
            color: white;
            box-shadow: 0 4px 12px ${colors.shadow};
          }
          .modal-btn-confirm:hover { transform: translateY(-1px); box-shadow: 0 6px 16px ${colors.shadow}; }
          .modal-btn-confirm:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
        `}</style>

        {/* Icon Header */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "20px",
              background: colors.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: colors.text,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "32px" }}>
              {colors.icon}
            </span>
          </div>
        </div>

        {/* Text */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <h3
            style={{
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: "12px",
              fontFamily: "'Manrope', sans-serif",
            }}
          >
            {title}
          </h3>
          <div
            style={{
              fontSize: "0.9375rem",
              lineHeight: "1.6",
              color: "#64748b",
            }}
          >
            {message}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
          <button className="modal-btn modal-btn-cancel" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </button>
          <button className="modal-btn modal-btn-confirm" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? (
              <span className="material-symbols-outlined animate-spin" style={{ fontSize: "20px" }}>
                refresh
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
