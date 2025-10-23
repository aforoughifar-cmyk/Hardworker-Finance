import React from 'react';

interface ChartDataItem {
    label: string;
    values: { value: number; color: string }[];
}

interface BarChartProps {
    data: ChartDataItem[];
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
    if (!data || data.length === 0) {
        return <div className="text-center text-gray-500 py-8">Grafik için veri yok.</div>;
    }

    const maxValue = Math.max(...data.flatMap(d => d.values.map(v => v.value)), 1);

    return (
        <div className="w-full h-80 flex items-end gap-4 px-4" aria-label="Bar chart">
            {data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full h-full flex items-end justify-center gap-1">
                         {item.values.map((v, vIndex) => (
                             <div 
                                key={vIndex}
                                className="w-full rounded-t-md transition-all duration-300" 
                                style={{ 
                                    height: `${(v.value / maxValue) * 100}%`,
                                    backgroundColor: v.color
                                }}
                                title={`${item.label}: ${v.value.toLocaleString()}`}
                            />
                         ))}
                    </div>
                    <span className="text-xs text-gray-500">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export default BarChart;