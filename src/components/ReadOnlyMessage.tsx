// src/components/ReadOnlyMessage.tsx
"use client";

import { motion } from "framer-motion";
import { ShieldX, Eye } from "lucide-react";

interface ReadOnlyMessageProps {
  action?: string;
  module?: string;
  className?: string;
}

export default function ReadOnlyMessage({
  action = "editar",
  module = "este recurso",
  className = "",
}: ReadOnlyMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-orange-50 via-white to-orange-50 border-2 border-orange-200 rounded-xl p-6 text-center max-w-md mx-auto ${className}`}
    >
      <div className="flex justify-center mb-4">
        <div className="p-3 bg-orange-100 rounded-full">
          <ShieldX className="w-8 h-8 text-orange-600" />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Acesso Restrito
      </h3>

      <p className="text-gray-600 mb-4">
        Você não tem permissão para <strong>{action}</strong> {module}.
      </p>

      <div className="flex items-center justify-center gap-2 text-sm text-orange-700 bg-orange-100 rounded-lg px-3 py-2">
        <Eye className="w-4 h-4" />
        <span>
          Seu acesso é <strong>somente leitura</strong>
        </span>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        Grupo: <strong>Cobrança/Financeiro</strong> | Permissão:{" "}
        <strong>Visualização</strong>
      </div>
    </motion.div>
  );
}
