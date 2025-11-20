import './Badge.css';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'teal' | 'blue' | 'purple' | 'red' | 'green' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = ({ children, variant = 'default', size = 'md' }: BadgeProps) => {
  return (
    <span className={`badge badge-${variant} badge-${size}`}>
      {children}
    </span>
  );
};

export default Badge;
