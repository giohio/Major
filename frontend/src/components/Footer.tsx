import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section footer-brand">
            <h3 className="footer-title">
              <span className="logo-text-mindcare">MindCare AI</span>
            </h3>
            <p className="footer-description">
              Nền tảng AI tâm lý học hàng đầu Việt Nam, kết hợp công nghệ tiên tiến với chuyên môn y khoa để mang đến giải pháp chăm sóc tâm lý toàn diện cho mọi người.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a href="#" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"/>
                </svg>
              </a>
              <a href="#" className="social-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Dịch vụ</h4>
            <ul className="footer-links">
              <li><Link to="/chat">Chat AI</Link></li>
              <li><Link to="/plans">Kết nối bác sĩ</Link></li>
              <li><Link to="/plans">Theo dõi sức khỏe</Link></li>
              <li><Link to="/plans">Hỗ trợ khẩn cấp</Link></li>
            </ul>
          </div>

          <div className="footer-section">
            <h4 className="footer-heading">Liên hệ</h4>
            <ul className="footer-links footer-contact">
              <li>
                <span>�</span>
                <a href="tel:19001234">1900 1234</a>
              </li>
              <li>
                <span>✉️</span>
                <a href="mailto:support@mindcare.ai">support@mindcare.ai</a>
              </li>
              <li>
                <span>�</span>
                <span>123 Nguyễn Huệ, Q1, TP.HCM</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2024 MindCare AI. Tất cả quyền được bảo lưu.</p>
          <p className="footer-powered">Powered by Beaddy</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
