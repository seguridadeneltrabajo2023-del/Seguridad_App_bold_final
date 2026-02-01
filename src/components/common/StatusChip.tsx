import { StatusType } from '../../types';

interface StatusChipProps {
  status: StatusType['variant'];
  label?: string;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    dotColor: 'bg-yellow-500',
  },
  approved: {
    label: 'Approved',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    dotColor: 'bg-green-500',
  },
  rejected: {
    label: 'Rejected',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    dotColor: 'bg-red-500',
  },
  active: {
    label: 'Active',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    dotColor: 'bg-green-500',
  },
  inactive: {
    label: 'Inactive',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-800',
    dotColor: 'bg-gray-500',
  },
  expired: {
    label: 'Expired',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    dotColor: 'bg-red-500',
  },
  expiring: {
    label: 'Expiring Soon',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-800',
    dotColor: 'bg-orange-500',
  },
};

export function StatusChip({ status, label }: StatusChipProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bgColor} ${config.textColor}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor}`} />
      {displayLabel}
    </span>
  );
}
