// src/components/boletos/StatusBadge.tsx
import { BoletoStatus, BoletoStatusOptions } from "@/types/boleto";

interface StatusBadgeProps {
  status: BoletoStatus;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const statusOption = BoletoStatusOptions.find(
    (option) => option.value === status
  );

  if (!statusOption) {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 ${className}`}
      >
        {status}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusOption.color} ${className}`}
    >
      {statusOption.label}
    </span>
  );
}
