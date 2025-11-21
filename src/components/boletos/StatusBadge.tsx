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
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          text: "Pago",
        };
      case "BAIXADO":
        return {
          color: "bg-green-500/20 text-green-400 border-green-500/30",
          text: "Pago (PIX)",
        };
      case "ATIVO":
      case "REGISTRADO":
        return {
          color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
          text: "Ativo",
        };
      case "VENCIDO":
        return {
          color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
          text: "Vencido",
        };
      case "CANCELADO":
        return {
          color: "bg-neutral-700 text-neutral-300 border-neutral-600",
          text: "Cancelado",
        };
      case "PENDENTE":
        return {
          color: "bg-neutral-700 text-neutral-300 border-neutral-600",
          text: "Pendente",
        };
      default:
        return {
          color: "bg-neutral-700 text-neutral-300 border-neutral-600",
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
      className={`inline-flex items-center justify-center rounded-full font-medium border ${config.color} ${sizeClasses[size]}`}
      title={statusDescription || config.text}
    >
      {config.text}
    </span>
  );
}
