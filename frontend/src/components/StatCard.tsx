import './StatCard.css';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  color?: 'teal' | 'blue' | 'purple' | 'red' | 'green' | 'yellow';
}

const StatCard = ({ icon, label, value, trend, color = 'teal' }: StatCardProps) => {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-card-header">
        <div className={`stat-icon stat-icon-${color}`}>
          {icon}
        </div>
        {trend && (
          <div className={`stat-trend ${trend.isPositive ? 'trend-up' : 'trend-down'}`}>
            {trend.isPositive ? '↗' : '↘'} {trend.value}
          </div>
        )}
      </div>
      <div className="stat-card-body">
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </div>
  );
};

export default StatCard;
