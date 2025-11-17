interface StatusBadgeProps {
  status: string;
  statusDescription?: string;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({
  status,
  statusDescription,
  size = "md",
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case "LIQUIDADO":
        return {
          color: "bg-green-100 text-green-800 border-green-300",
          icon: "✅",
          text: "Liquidado",
        };
      case "BAIXADO":
        return {
          color: "bg-green-100 text-green-800 border-green-300",
          icon: "💰",
          text: "Pago (PIX)",
        };
      case "ATIVO":
      case "VENCIDO":
        return {
          color: "bg-yellow-100 text-yellow-800 border-yellow-300",
          icon: "⏳",
          text: "Vencido",
        };
      case "REGISTRADO":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-300",
          icon: "📄",
          text: "Registrado",
        };
      case "CANCELADO":
        return {
          color: "bg-red-100 text-red-800 border-red-300",
          icon: "❌",
          text: "Cancelado (Banco)",
        };
      case "PENDENTE":
        return {
          color: "bg-gray-100 text-gray-800 border-gray-300",
          icon: "📝",
          text: "Cancelado",
        };
      default:
        return {
          color: "bg-gray-100 text-gray-800 border-gray-300",
          icon: "❓",
          text: status,
        };
    }
  };

  const config = getStatusConfig(status);

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}
      title={statusDescription || config.text}
    >
      <span>{config.icon}</span>
      <span>{config.text}</span>
    </span>
  );
}
