import './PageHeader.css';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  gradient?: 'teal' | 'purple' | 'blue' | 'red' | 'green';
}

const PageHeader = ({ title, subtitle, icon, gradient = 'teal' }: PageHeaderProps) => {
  return (
    <div className={`page-header-modern ${gradient}`}>
      <div className="container">
        <div className="page-header-content">
          {icon && <div className="page-header-icon">{icon}</div>}
          <h1 className="page-header-title">{title}</h1>
          {subtitle && <p className="page-header-subtitle">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
