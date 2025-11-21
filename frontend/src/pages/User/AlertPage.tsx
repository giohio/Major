import { useNavigate } from 'react-router-dom';
import './AlertPage.css';

const AlertPage = () => {
  const navigate = useNavigate();

  const emergencyContacts = [
    { name: 'Đường dây nóng Tâm lý 24/7', phone: '1800-xxxx', icon: '📞' },
    { name: 'Cấp cứu khẩn cấp', phone: '113', icon: '🚑', emergency: true },
    { name: 'Trung tâm Phòng chống Tự tử', phone: '1900-xxxx', icon: '💙' }
  ];

  const quickActions = [
    {
      icon: '🌬️',
      title: 'Hít thở sâu',
      description: 'Thực hiện kỹ thuật 4-7-8 để giảm lo âu ngay lập tức',
      action: () => navigate('/user/exercises')
    },
    {
      icon: '👩‍⚕️',
      title: 'Tìm bác sĩ',
      description: 'Kết nối với chuyên gia tâm lý chuyên nghiệp',
      action: () => navigate('/user/find-doctor')
    },
    {
      icon: '💬',
      title: 'Tiếp tục chat',
      description: 'Chia sẻ thêm với AI để được hỗ trợ tốt hơn',
      action: () => navigate('/chat')
    },
    {
      icon: '📖',
      title: 'Bài tập tự chăm sóc',
      description: 'Thử các bài tập mindfulness và thư giãn',
      action: () => navigate('/user/exercises')
    }
  ];

  const supportResources = [
    {
      title: 'Kỹ thuật căn bản',
      items: [
        'Kỹ thuật 5-4-3-2-1 để kết nối với hiện tại',
        'Hít thở sâu bằng bụng',
        'Thư giãn cơ tiến triển',
        'Ghi nhật ký cảm xúc'
      ]
    },
    {
      title: 'Tài nguyên hữu ích',
      items: [
        'Cộng đồng hỗ trợ trực tuyến',
        'Sách và podcast về sức khỏe tâm thần',
        'Video hướng dẫn mindfulness',
        'Diễn đàn chia sẻ kinh nghiệm'
      ]
    }
  ];

  return (
    <div className="alert-page">
      {/* Banner */}
      <div className="alert-banner">
        <div className="banner-icon">�</div>
        <h1 className="banner-title">Chúng Tôi Quan Tâm Đến Bạn</h1>
        <p className="banner-message">
          Tôi nhận thấy bạn có thể đang trải qua giai đoạn khó khăn. 
          Hãy nhớ rằng bạn không đơn độc và luôn có sự giúp đỡ.
        </p>
      </div>

      {/* Emergency Contacts */}
      <div className="emergency-section">
        <h2 className="section-title urgent">
          <span className="title-icon">🚨</span>
          Hỗ Trợ Khẩn Cấp
        </h2>
        <p className="section-description">
          Nếu bạn đang có suy nghĩ tự tử hoặc cần hỗ trợ khẩn cấp, hãy liên hệ ngay:
        </p>
        <div className="emergency-contacts">
          {emergencyContacts.map((contact, index) => (
            <a
              key={index}
              href={`tel:${contact.phone}`}
              className={`emergency-card ${contact.emergency ? 'critical' : ''}`}
            >
              <div className="contact-icon">{contact.icon}</div>
              <div className="contact-info">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-phone">{contact.phone}</div>
              </div>
              <div className="call-arrow">→</div>
            </a>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h2 className="section-title">
          <span className="title-icon">⚡</span>
          Hành Động Ngay
        </h2>
        <div className="actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="action-card"
              onClick={action.action}
            >
              <div className="action-icon">{action.icon}</div>
              <h3 className="action-title">{action.title}</h3>
              <p className="action-description">{action.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Support Resources */}
      <div className="resources-section">
        <h2 className="section-title">
          <span className="title-icon">📚</span>
          Tài Nguyên Hỗ Trợ
        </h2>
        <div className="resources-grid">
          {supportResources.map((resource, index) => (
            <div key={index} className="resource-card">
              <h3 className="resource-title">{resource.title}</h3>
              <ul className="resource-list">
                {resource.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="resource-item">
                    <span className="item-bullet">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Reassurance Message */}
      <div className="reassurance-message">
        <div className="message-icon">💪</div>
        <div className="message-content">
          <h3>Bạn Rất Dũng Cảm</h3>
          <p>
            Việc tìm kiếm sự giúp đỡ là dấu hiệu của sức mạnh, không phải yếu đuối. 
            Mỗi bước bạn đi để chăm sóc sức khỏe tinh thần của mình đều xứng đáng được tôn trọng.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AlertPage;
