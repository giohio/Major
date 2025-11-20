// Script to generate all remaining pages
const fs = require('fs');
const path = require('path');

const pages = {
  'User': [
    'Profile', 'EmotionDashboard', 'Exercises', 'ChatHistory', 
    'PaymentHistory', 'Settings', 'AlertPage', 'FindDoctor', 'BookAppointment'
  ],
  'Doctor': [
    'Dashboard', 'PatientList', 'PatientProfile', 'PatientChat',
    'Appointments', 'TherapyLibrary', 'Alerts'
  ],
  'Admin': [
    'Dashboard', 'UserManagement', 'DoctorManagement', 'SubscriptionManagement',
    'AIModelManagement', 'Analytics', 'AuditLogs'
  ],
  '': ['SubscriptionPlans', 'Contact']
};

const generatePageTemplate = (pageName, folder) => {
  const iconMap = {
    // User pages
    'Profile': '👤',
    'EmotionDashboard': '📈',
    'Exercises': '🧘‍♀️',
    'ChatHistory': '📝',
    'PaymentHistory': '🧾',
    'Settings': '⚙️',
    'AlertPage': '🚨',
    'FindDoctor': '👩‍⚕️',
    'BookAppointment': '📅',
    // Doctor pages
    'Dashboard': '🏠',
    'PatientList': '👥',
    'PatientProfile': '📁',
    'PatientChat': '💬',
    'Appointments': '🗓️',
    'TherapyLibrary': '📚',
    'Alerts': '🚨',
    // Admin pages
    'UserManagement': '👥',
    'DoctorManagement': '🩺',
    'SubscriptionManagement': '💰',
    'AIModelManagement': '🧠',
    'Analytics': '📈',
    'AuditLogs': '🔐',
    // Public pages
    'SubscriptionPlans': '💰',
    'Contact': '📞'
  };

  const icon = iconMap[pageName] || '📄';
  const title = pageName.replace(/([A-Z])/g, ' $1').trim();

  return `import './Page.css';

const ${pageName} = () => {
  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">
          <span className="page-icon">${icon}</span>
          ${title}
        </h1>
        <p className="page-description">
          Trang ${title.toLowerCase()} - Đang trong quá trình phát triển
        </p>
      </div>

      <div className="page-content">
        <div className="placeholder-card">
          <div className="placeholder-icon">${icon}</div>
          <h3>Tính năng đang được phát triển</h3>
          <p>Trang này sẽ sớm được hoàn thành với đầy đủ tính năng.</p>
        </div>
      </div>
    </div>
  );
};

export default ${pageName};
`;
};

const cssTemplate = `.page {
  min-height: 100vh;
}

.page-header {
  background: var(--bg-card);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-xl);
}

.page-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.page-icon {
  font-size: var(--font-size-4xl);
}

.page-description {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}

.page-content {
  background: var(--bg-card);
  padding: var(--spacing-2xl);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.placeholder-card {
  text-align: center;
  padding: var(--spacing-3xl);
}

.placeholder-icon {
  font-size: 5rem;
  margin-bottom: var(--spacing-lg);
}

.placeholder-card h3 {
  margin-bottom: var(--spacing-md);
  color: var(--text-primary);
}

.placeholder-card p {
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
}
`;

// Generate pages
Object.keys(pages).forEach(folder => {
  pages[folder].forEach(pageName => {
    const folderPath = folder ? path.join(__dirname, '..', 'pages', folder) : path.join(__dirname, '..', 'pages');
    const filePath = path.join(folderPath, `${pageName}.tsx`);
    
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
    
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, generatePageTemplate(pageName, folder));
      console.log(`✅ Created: ${filePath}`);
    }
  });
});

// Create shared Page.css
const cssPath = path.join(__dirname, '..', 'pages', 'Page.css');
if (!fs.existsSync(cssPath)) {
  fs.writeFileSync(cssPath, cssTemplate);
  console.log(`✅ Created: ${cssPath}`);
}

console.log('\\n🎉 All pages generated successfully!');
