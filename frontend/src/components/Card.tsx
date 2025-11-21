import './Card.css';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  variant?: 'default' | 'bordered' | 'elevated' | 'gradient';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  className?: string;
}

const Card = ({ 
  children, 
  variant = 'default', 
  padding = 'lg',
  hover = false,
  className = ''
}: CardProps) => {
  return (
    <div className={`card-modern card-${variant} card-padding-${padding} ${hover ? 'card-hover' : ''} ${className}`}>
      {children}
    </div>
  );
};

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: ReactNode;
}

export const CardHeader = ({ title, subtitle, icon, action }: CardHeaderProps) => {
  return (
    <div className="card-header-modern">
      <div className="card-header-left">
        {icon && <span className="card-header-icon">{icon}</span>}
        <div>
          <h3 className="card-title-modern">{title}</h3>
          {subtitle && <p className="card-subtitle-modern">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="card-header-action">{action}</div>}
    </div>
  );
};

interface CardContentProps {
  children: ReactNode;
}

export const CardContent = ({ children }: CardContentProps) => {
  return <div className="card-content-modern">{children}</div>;
};

interface CardFooterProps {
  children: ReactNode;
}

export const CardFooter = ({ children }: CardFooterProps) => {
  return <div className="card-footer-modern">{children}</div>;
};

export default Card;
