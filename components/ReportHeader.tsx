import React from 'react';

// Defines the shape of a single statistic item
export interface ReportStat {
  label: string;
  value: string | number;
  colorClass: string; // Tailwind CSS class for the border color, e.g., 'border-blue-500'
}

interface ReportHeaderProps {
  stats: ReportStat[];
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ stats }) => {
  if (!stats || stats.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {stats.map((stat, index) => (
          <div 
            key={index} 
            className={`bg-white p-4 rounded-xl shadow-md border-l-4 transition-transform transform hover:-translate-y-1 ${stat.colorClass}`}
          >
            <p className="text-sm font-medium text-gray-500 truncate">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-800">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportHeader;
