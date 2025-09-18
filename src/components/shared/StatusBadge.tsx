import React from 'react';

export interface StatusBadgeProps {
  status: "pending" | "acknowledged" | "in-progress" | "under-review" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent" | "emergency";
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, priority }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'pending':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityDot = () => {
    if (!priority) return null;
    const dotColor = {
      low: 'bg-blue-400',
      medium: 'bg-yellow-400',
      high: 'bg-orange-400',
      urgent: 'bg-red-500 animate-pulse',
      emergency: 'bg-red-700 animate-pulse'
    }[priority];

    return <span className={`w-2 h-2 rounded-full ${dotColor} mr-1`}></span>;
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-all duration-200 ${getStatusClasses()}`}>
      {getPriorityDot()}
      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
    </span>
  );
};

export default StatusBadge;
