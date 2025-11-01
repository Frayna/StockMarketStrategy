import React from 'react';

interface StatsCardProps {
  label: string;
  value: string | number;
  valueColor?: string;
  icon?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  label,
  value,
  valueColor = 'text-gray-900',
  icon
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6 text-center">
      <div className="text-sm font-medium text-gray-500 mb-2">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </div>
      <div className={`text-2xl font-bold ${valueColor}`}>
        {value}
      </div>
    </div>
  );
};
