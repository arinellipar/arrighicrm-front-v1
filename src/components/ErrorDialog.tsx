"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X, RefreshCw } from "lucide-react";

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry?: () => void;
  title?: string;
  message: string;
  showRetry?: boolean;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
}

export default function ErrorDialog({
  isOpen,
  onClose,
  onRetry,
  title = "Erro",
  message,
  showRetry = true,
  primaryAction,
  secondaryAction,
}: ErrorDialogProps) {
  const hasCustomActions = Boolean(primaryAction || secondaryAction);

  const buttonClasses = (variant: "primary" | "secondary" = "primary") => {
    return variant === "primary"
      ? "px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
      : "px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
              {/* Header */}
              <div className="bg-red-50 border-b border-red-200 px-6 py-4 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-lg">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-red-900">
                        {title}
                      </h2>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <p className="text-red-700 leading-relaxed">{message}</p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-red-200 rounded-b-2xl">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-red-700 hover:bg-red-50 rounded-lg font-medium transition-colors"
                >
                  Fechar
                </button>
                {hasCustomActions ? (
                  <>
                    {secondaryAction && (
                      <button
                        onClick={secondaryAction.onClick}
                        className={buttonClasses(secondaryAction.variant)}
                      >
                        {secondaryAction.label}
                      </button>
                    )}
                    {primaryAction && (
                      <button
                        onClick={primaryAction.onClick}
                        className={buttonClasses(primaryAction.variant)}
                      >
                        {primaryAction.label}
                      </button>
                    )}
                  </>
                ) : (
                  showRetry &&
                  onRetry && (
                  <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Tentar Novamente
                  </button>
                  )
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
