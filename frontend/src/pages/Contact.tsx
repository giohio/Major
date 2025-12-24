import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="container">
          <div className="contact-hero-content">
            <h1 className="contact-title">Liên hệ với chúng tôi</h1>
            <p className="contact-subtitle">
              Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy để lại thông tin, 
              chúng tôi sẽ phản hồi trong thời gian sớm nhất.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            {/* Left: Contact Info */}
            <div>
              <h2 className="section-heading">Thông tin liên hệ</h2>
              
              <div className="contact-cards">
                <div className="contact-card">
                  <div className="contact-icon-circle phone">
                    📞
                  </div>
                  <h3>Phone</h3>
                  <p className="contact-detail">1900-XXXX</p>
                  <p className="contact-description">Hỗ trợ 24/7</p>
                </div>

                <div className="contact-card">
                  <div className="contact-icon-circle email">
                    ✉️
                  </div>
                  <h3>Email</h3>
                  <p className="contact-detail">support@mindcare.ai</p>
                  <p className="contact-description">Phản hồi trong 24h</p>
                </div>

                <div className="contact-card">
                  <div className="contact-icon-circle location">
                    📍
                  </div>
                  <h3>Địa chỉ</h3>
                  <p className="contact-detail">123 ABC Street</p>
                  <p className="contact-description">Quận XYZ, TP.HCM</p>
                </div>

                <div className="contact-card">
                  <div className="contact-icon-circle time">
                    🕐
                  </div>
                  <h3>Giờ làm việc</h3>
                  <p className="contact-detail">24/7</p>
                  <p className="contact-description">Luôn sẵn sàng hỗ trợ</p>
                </div>
              </div>

              {/* Social Media */}
              <div className="social-section">
                <h3>Kết nối với chúng tôi</h3>
                <div className="social-links-contact">
                  <a href="#" className="social-btn facebook">
                    📘 Facebook
                  </a>
                  <a href="#" className="social-btn twitter">
                    🔗 LinkedIn
                  </a>
                  <a href="#" className="social-btn instagram">
                    📷 Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Right: Contact Form */}
            <div className="contact-form-wrapper">
              <h2 className="section-heading">Gửi tin nhắn</h2>
              
              <form className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fullname">Họ và tên *</label>
                    <input 
                      type="text" 
                      id="fullname" 
                      placeholder="Nguyễn Văn A" 
                      required 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input 
                      type="email" 
                      id="email" 
                      placeholder="your@email.com" 
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      placeholder="0912345678" 
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject">Chủ đề *</label>
                    <select id="subject" required>
                      <option value="">Chọn chủ đề</option>
                      <option value="consultation">Tư vấn</option>
                      <option value="technical">Hỗ trợ kỹ thuật</option>
                      <option value="partnership">Hợp tác</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Nội dung *</label>
                  <textarea 
                    id="message" 
                    placeholder="Nhập nội dung tin nhắn của bạn..." 
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-block">
                  ✉️ Gửi tin nhắn
                </button>

                <p className="form-note">
                  Chúng tôi cam kết bảo mật thông tin của bạn
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Contact Section */}
      <section className="emergency-section">
        <div className="container">
          <div className="emergency-banner">
            <div className="emergency-icon">🚨</div>
            <div className="emergency-content">
              <h3>Cần hỗ trợ khẩn cấp?</h3>
              <p>If you are experiencing a mental health crisis or have suicidal thoughts, 
                please contact our 24/7 hotline immediately</p>
              <div className="emergency-contacts">
                <a href="tel:1900xxxx" className="emergency-btn emergency">
                  📞 1900-XXXX
                </a>
                <span className="emergency-divider">hoặc</span>
                <a href="tel:113" className="emergency-btn">
                  🚑 Gọi 113
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
