import { Link } from 'react-router-dom';
import './LandingPage.css';
import heroImage from '../assets/z7181096252558_04827206b9f87aa9e4467abf5907eb6d.jpg';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section 
        className="hero-section-custom"
        style={{
          position: 'relative',
          minHeight: '650px',
          height: 'calc(100vh - 80px)',
          maxHeight: '800px',
          display: 'flex',
          alignItems: 'center',
          overflow: 'hidden',
          padding: '60px 0 40px',
          marginTop: '80px'
        }}
      >
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0
          }}
        >
          <img 
            src={heroImage} 
            alt="MindCare AI Background"
            className="hero-image-custom"
            style={{
              width: 'auto',
              height: '100%',
              minWidth: '100%',
              objectFit: 'cover',
              objectPosition: 'center center',
              filter: 'brightness(1.05) contrast(1.05)'
            }}
          />
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(to right, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 40%, rgba(255, 255, 255, 0.05) 70%, transparent 100%)'
            }}
          />
        </div>
        <div className="container">
          <div 
            style={{
              position: 'relative',
              zIndex: 2,
              maxWidth: '500px'
            }}
          >
            <h1 
              style={{
                fontSize: '2.5rem',
                fontWeight: 900,
                lineHeight: 1.1,
                color: '#1F2937',
                marginBottom: '14px',
                textShadow: '0 2px 8px rgba(255, 255, 255, 0.95), 0 1px 4px rgba(0, 0, 0, 0.15)'
              }}
            >
              Chăm sóc <span 
                style={{
                  color: '#4FD1C7',
                  display: 'block',
                  fontWeight: 900,
                  textShadow: '0 2px 8px rgba(255, 255, 255, 0.95), 0 1px 4px rgba(79, 209, 199, 0.3)'
                }}
              >
                sức khỏe<br />
                tinh thần
              </span> <span 
                style={{
                  color: '#1F2937',
                  fontWeight: 900,
                  textShadow: '0 2px 8px rgba(255, 255, 255, 0.95), 0 1px 4px rgba(0, 0, 0, 0.15)'
                }}
              >
                với AI
              </span>
            </h1>
            <p 
              style={{
                fontSize: '0.9rem',
                lineHeight: 1.5,
                color: '#374151',
                marginBottom: '18px',
                fontWeight: 500,
                textShadow: '0 2px 6px rgba(255, 255, 255, 0.9), 0 1px 3px rgba(0, 0, 0, 0.1)'
              }}
            >
              Nền tảng AI tâm lý học tiên tiến, kết nối bạn với các chuyên gia hàng đầu. 
              Hỗ trợ 24/7, phát hiện sớm các dấu hiệu rủi ro và đưa ra can thiệp kịp thời.
            </p>
            <div 
              style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '16px',
                flexWrap: 'wrap'
              }}
            >
              <Link 
                to="/chat" 
                style={{
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.3s ease',
                  background: '#4FD1C7',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 2px 8px rgba(79, 209, 199, 0.3)'
                }}
              >
                💬 Trò chuyện với AI ngay
              </Link>
              <Link 
                to="/about" 
                style={{
                  padding: '10px 20px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  borderRadius: '6px',
                  textDecoration: 'none',
                  display: 'inline-block',
                  transition: 'all 0.3s ease',
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: '#4FD1C7',
                  border: '2px solid #4FD1C7',
                  backdropFilter: 'blur(6px)'
                }}
              >
                Tìm hiểu thêm
              </Link>
            </div>
            <div 
              style={{
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  style={{
                    color: '#4FD1C7',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textShadow: '0 2px 6px rgba(255, 255, 255, 0.9)'
                  }}
                >
                  ✓
                </span>
                <span 
                  style={{
                    color: '#374151',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textShadow: '0 2px 6px rgba(255, 255, 255, 0.9)'
                  }}
                >
                  Hỗ trợ 24/7
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  style={{
                    color: '#4FD1C7',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textShadow: '0 2px 6px rgba(255, 255, 255, 0.9)'
                  }}
                >
                  ✓
                </span>
                <span 
                  style={{
                    color: '#374151',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textShadow: '0 2px 6px rgba(255, 255, 255, 0.9)'
                  }}
                >
                  Tư vấn 24/7
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span 
                  style={{
                    color: '#4FD1C7',
                    fontSize: '0.95rem',
                    fontWeight: 700,
                    textShadow: '0 2px 6px rgba(255, 255, 255, 0.9)'
                  }}
                >
                  ✓
                </span>
                <span 
                  style={{
                    color: '#374151',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textShadow: '0 2px 6px rgba(255, 255, 255, 0.9)'
                  }}
                >
                  Miễn phí dùng thử
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-heading">
              Tại sao chọn <span className="text-teal">MindCare AI</span>?
            </h2>
            <p className="section-desc">
              Chúng tôi kết hợp công nghệ AI tiên tiến với chuyên môn y khoa để mang đến giải pháp chăm sóc tâm lý toàn diện.
            </p>
          </div>
          
          <div className="features-grid">
            <div className="feature-box">
              <div className="feature-icon bg-blue">
                <span>🏠</span>
              </div>
              <h3 className="feature-name">AI Tư vấn 24/7</h3>
              <p className="feature-text">
                Trò chuyện với AI được đào tạo chuyên sâu về tâm lý học. Hệ thống phân tích cảm xúc và phát hiện dấu hiệu bất thường.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon bg-green">
                <span>🔗</span>
              </div>
              <h3 className="feature-name">Kết nối Chuyên gia</h3>
              <p className="feature-text">
                Được kết nối với bác sĩ tâm lý có kinh nghiệm khi AI phát hiện dấu hiệu cần can thiệp. Tạo hồ sơ bệnh nhân và bắt đầu điều trị.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon bg-purple">
                <span>💜</span>
              </div>
              <h3 className="feature-name">Theo dõi Sức khỏe</h3>
              <p className="feature-text">
                Hệ thống theo dõi và phân tích tình trạng cảm xúc, đưa ra cảnh báo kịp thời.
              </p>
            </div>

            <div className="feature-box">
              <div className="feature-icon bg-red">
                <span>🛡️</span>
              </div>
              <h3 className="feature-name">Bảo mật Tuyệt đối</h3>
              <p className="feature-text">
                Thông tin cá nhân được mã hóa và bảo vệ theo tiêu chuẩn quốc tế.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="process-section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-heading">
              <span className="text-teal">Quy trình</span> hoạt động
            </h2>
            <p className="section-desc">
              Hệ thống AI thông minh phát hiện và can thiệp kịp thời khi phát hiện dấu hiệu rủi ro.
            </p>
          </div>

          <div className="process-steps">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-image">
                <div className="step-img-box">
                  <span className="step-emoji">�‍💻</span>
                </div>
              </div>
              <div className="step-icon">
                <span>💬</span>
              </div>
              <h3 className="step-title">Trò chuyện với AI</h3>
              <p className="step-desc">
                Bắt đầu cuộc trò chuyện với AI tâm lý học. Hệ thống phân tích cảm xúc và phát hiện dấu hiệu bất thường.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-image">
                <div className="step-img-box">
                  <span className="step-emoji">📊</span>
                </div>
              </div>
              <div className="step-icon">
                <span>⚠️</span>
              </div>
              <h3 className="step-title">AI phát hiện rủi ro</h3>
              <p className="step-desc">
                Khi AI phát hiện stress cao hoặc nguy cơ tự hại, hệ thống sẽ hiển thị cảnh báo và đề xuất bác sĩ phù hợp.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-image">
                <div className="step-img-box">
                  <span className="step-emoji">👨‍⚕️</span>
                </div>
              </div>
              <div className="step-icon">
                <span>👥</span>
              </div>
              <h3 className="step-title">Kết nối chuyên gia</h3>
              <p className="step-desc">
                Được kết nối trực tiếp với bác sĩ tâm lý có kinh nghiệm. Tạo hồ sơ bệnh nhân và bắt đầu điều trị.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="pricing-section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-heading">
              <span className="text-teal">Gói dịch vụ</span> phù hợp với bạn
            </h2>
            <p className="section-desc">
              Lựa chọn gói dịch vụ phù hợp với nhu cầu và ngân sách của bạn.
            </p>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <h3 className="pricing-plan-name">Dùng thử</h3>
              <div className="pricing-price">
                <span className="price-amount">Miễn phí</span>
              </div>
              <ul className="pricing-features">
                <li><span className="check">✓</span> 5 cuộc trò chuyện/ngày với AI</li>
                <li><span className="check">✓</span> Đánh giá tâm lý cơ bản</li>
                <li><span className="check">✓</span> Theo dõi cảm xúc hàng ngày</li>
                <li><span className="check">✓</span> Hỗ trợ qua email</li>
              </ul>
              <Link to="/register" className="btn btn-outline-teal btn-block">
                Bắt đầu miễn phí
              </Link>
            </div>

            <div className="pricing-card featured">
              <div className="popular-badge">Phổ biến nhất</div>
              <h3 className="pricing-plan-name">Cá nhân</h3>
              <div className="pricing-price">
                <span className="price-amount">299,000₫</span>
                <span className="price-period">/tháng</span>
              </div>
              <ul className="pricing-features">
                <li><span className="check">✓</span> Trò chuyện không giới hạn với AI</li>
                <li><span className="check">✓</span> Kết nối với bác sĩ tâm lý</li>
                <li><span className="check">✓</span> Báo cáo chi tiết hàng tuần</li>
                <li><span className="check">✓</span> Cảnh báo khẩn cấp 24/7</li>
                <li><span className="check">✓</span> Hỗ trợ ưu tiên</li>
              </ul>
              <Link to="/register" className="btn btn-primary btn-block">
                Chọn gói này
              </Link>
            </div>

            <div className="pricing-card">
              <h3 className="pricing-plan-name">Gia đình</h3>
              <div className="pricing-price">
                <span className="price-amount">599,000₫</span>
                <span className="price-period">/tháng</span>
              </div>
              <ul className="pricing-features">
                <li><span className="check">✓</span> Tất cả tính năng gói Cá nhân</li>
                <li><span className="check">✓</span> Hỗ trợ tối đa 4 thành viên</li>
                <li><span className="check">✓</span> Dashboard gia đình</li>
                <li><span className="check">✓</span> Tư vấn gia đình</li>
                <li><span className="check">✓</span> Báo cáo tổng hợp</li>
              </ul>
              <Link to="/register" className="btn btn-outline-teal btn-block">
                Chọn gói này
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <div className="section-head">
            <h2 className="section-heading">
              <span className="text-teal">Người dùng</span> nói gì về chúng tôi
            </h2>
            <p className="section-desc">
              Hàng nghìn người đã tin tưởng và cải thiện sức khỏe tinh thần cùng MindCare AI.
            </p>
          </div>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  <span>👩</span>
                </div>
                <div className="testimonial-info">
                  <h4 className="testimonial-name">Nguyễn Thị Lan</h4>
                  <p className="testimonial-role">Nhân viên văn phòng</p>
                </div>
              </div>
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "MindCare AI đã giúp tôi vượt qua giai đoạn stress căng việc. AI rất thông minh và bác sĩ tư vấn rất tận tâm."
              </p>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  <span>👨</span>
                </div>
                <div className="testimonial-info">
                  <h4 className="testimonial-name">Trần Văn Minh</h4>
                  <p className="testimonial-role">Sinh viên đại học</p>
                </div>
              </div>
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "Dịch vụ tuyệt vời! AI phát hiện được tình trạng lo âu của tôi và kết nối với bác sĩ phù hợp. Cảm ơn MindCare AI!"
              </p>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="testimonial-avatar">
                  <span>�‍🦰</span>
                </div>
                <div className="testimonial-info">
                  <h4 className="testimonial-name">Lê Thị Hương</h4>
                  <p className="testimonial-role">Mẹ của 2 con</p>
                </div>
              </div>
              <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
              <p className="testimonial-text">
                "Gói gia đình rất hữu ích. Cả gia đình tôi đều được chăm sóc tâm lý tốt. Hệ thống cảnh báo rất kịp thời."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-box">
            <h2 className="cta-heading">
              Bắt đầu hành trình chăm sóc tâm lý ngay hôm nay
            </h2>
            <p className="cta-text">
              Đừng để stress và lo âu ảnh hưởng đến cuộc sống. Hãy để AI và các chuyên gia đồng hành cùng bạn.
            </p>
            <div className="cta-actions">
              <Link to="/chat" className="btn btn-white-solid btn-lg">
                Trò chuyện miễn phí ngay
              </Link>
              <Link to="/register" className="btn btn-white-outline btn-lg">
                Đăng ký tài khoản
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Talk with Us Button */}
      <Link 
        to="/chat"
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: '#4FD1C7',
          color: 'white',
          padding: '14px 28px',
          borderRadius: '30px',
          fontSize: '0.95rem',
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 4px 20px rgba(79, 209, 199, 0.4)',
          transition: 'all 0.3s ease',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(79, 209, 199, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(79, 209, 199, 0.4)';
        }}
      >
        💬 Talk with Us
      </Link>
    </div>
  );
};

export default LandingPage;
