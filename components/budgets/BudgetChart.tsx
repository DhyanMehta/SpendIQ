"use client";

interface BudgetChartProps {
  budgeted: number;
  actual: number;
}

export default function BudgetChart({ budgeted, actual }: BudgetChartProps) {
  const percentage = budgeted > 0 ? (actual / budgeted) * 100 : 0;
  const cappedPercentage = Math.min(percentage, 100);

  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 100) return "#ef4444"; // red - over budget
    if (percentage >= 90) return "#f59e0b"; // orange - warning
    if (percentage >= 75) return "#eab308"; // yellow - caution
    return "#22c55e"; // green - on track
  };

  const color = getColor();
  const size = 48;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (cappedPercentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-300"
        />
      </svg>
      {/* Percentage text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold" style={{ color }}>
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}
