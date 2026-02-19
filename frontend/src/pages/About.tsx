import './About.css';

const About = () => {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-content">
            <h1 className="about-title">Về MindCare AI</h1>
            <p className="about-subtitle">
              Chúng tôi cam kết mang đến giải pháp chăm sóc sức khỏe tinh thần 
              tiên tiến nhất thông qua công nghệ AI và đội ngũ chuyên gia hàng đầu.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <h2 className="section-heading">Sứ mệnh của chúng tôi</h2>
            <p className="mission-text">
              MindCare AI was founded with the mission to democratize access to mental health services 
              chăm sóc sức khỏe tinh thần chất lượng cao. Chúng tôi tin rằng mọi người 
              everyone deserves timely and effective mental health support.
            </p>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-heading">Giá trị cốt lõi</h2>
          <div className="values-grid">
            <div className="value-item">
              <div className="value-icon">🤖</div>
              <h3 className="value-title">Công nghệ tiên tiến</h3>
              <p className="value-text">
                Sử dụng AI và machine learning để phân tích và đưa ra lời khuyên chính xác.
              </p>
            </div>
            <div className="value-item">
              <div className="value-icon">❤️</div>
              <h3 className="value-title">Tận tâm chăm sóc</h3>
              <p className="value-text">
                Đặt sức khỏe tinh thần của người dùng lên hàng đầu trong mọi quyết định.
              </p>
            </div>
            <div className="value-item">
              <div className="value-icon">🔒</div>
              <h3 className="value-title">Bảo mật tuyệt đối</h3>
              <p className="value-text">
                Cam kết bảo vệ thông tin cá nhân và dữ liệu y tế của người dùng.
              </p>
            </div>
            <div className="value-item">
              <div className="value-icon">🌟</div>
              <h3 className="value-title">Chất lượng hàng đầu</h3>
              <p className="value-text">
                Không ngừng cải tiến để mang đến trải nghiệm tốt nhất cho người dùng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-heading">Đội ngũ chuyên gia</h2>
          <p className="team-description">
            MindCare AI is built by a team of psychologists, 
            kỹ sư AI và các bác sĩ có kinh nghiệm lâu năm trong lĩnh vực sức khỏe tinh thần.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
