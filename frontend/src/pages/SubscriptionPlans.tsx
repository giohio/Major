import { Link } from 'react-router-dom';
import { PageHeader, Card } from '../components';
import './SubscriptionPlans.css';

const SubscriptionPlans = () => {
  const plans = [
    {
      name: 'Dùng thử',
      price: 'Miễn phí',
      period: '',
      description: 'Trải nghiệm các tính năng cơ bản',
      features: [
        { text: '5 cuộc trò chuyện/ngày với AI', included: true },
        { text: 'Đánh giá tâm lý cơ bản', included: true },
        { text: 'Theo dõi cảm xúc hàng ngày', included: true },
        { text: 'Hỗ trợ qua email', included: true },
        { text: 'Lưu lịch sử 7 ngày', included: true },
        { text: 'Kết nối bác sĩ', included: false },
        { text: 'Báo cáo chi tiết', included: false },
      ],
      buttonText: 'Bắt đầu miễn phí',
      buttonVariant: 'outline' as const,
      popular: false,
    },
    {
      name: 'Cá nhân',
      price: '299,000₫',
      period: '/tháng',
      description: 'Giải pháp toàn diện cho cá nhân',
      features: [
        { text: 'Trò chuyện không giới hạn với AI', included: true },
        { text: 'Kết nối với bác sĩ tâm lý', included: true },
        { text: 'Báo cáo chi tiết hàng tuần', included: true },
        { text: 'Cảnh báo khẩn cấp 24/7', included: true },
        { text: 'Bài tập tự chăm sóc cá nhân hóa', included: true },
        { text: 'Hỗ trợ ưu tiên', included: true },
        { text: 'Video session với bác sĩ', included: false },
      ],
      buttonText: 'Chọn gói này',
      buttonVariant: 'primary' as const,
      popular: true,
    },
    {
      name: 'Gia đình',
      price: '599,000₫',
      period: '/tháng',
      description: 'Chăm sóc toàn diện cho cả gia đình',
      features: [
        { text: 'Tất cả tính năng gói Cá nhân', included: true },
        { text: 'Hỗ trợ tối đa 4 thành viên', included: true },
        { text: 'Dashboard gia đình', included: true },
        { text: 'Tư vấn gia đình', included: true },
        { text: 'Báo cáo tổng hợp gia đình', included: true },
        { text: 'Video session không giới hạn', included: true },
        { text: 'Chương trình chăm sóc dài hạn', included: true },
      ],
      buttonText: 'Chọn gói này',
      buttonVariant: 'outline' as const,
      popular: false,
    },
  ];

  return (
    <div className="subscription-page">
      <PageHeader
        title="Gói dịch vụ phù hợp với bạn"
        subtitle="Lựa chọn gói dịch vụ phù hợp với nhu cầu và ngân sách của bạn. Hủy bất cứ lúc nào."
        icon="💰"
        gradient="teal"
      />

      <section className="plans-section">
        <div className="container">
          <div className="plans-grid">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                variant={plan.popular ? 'gradient' : 'bordered'}
                padding="xl"
                hover
                className={plan.popular ? 'plan-featured' : ''}
              >
                {plan.popular && (
                  <div className="plan-badge">
                    <span className="badge-star">⭐</span>
                    Phổ biến nhất
                  </div>
                )}
                
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <p className="plan-description">{plan.description}</p>
                </div>

                <div className="plan-pricing">
                  <span className="plan-price">{plan.price}</span>
                  {plan.period && <span className="plan-period">{plan.period}</span>}
                </div>

                <ul className="plan-features">
                  {plan.features.map((feature, index) => (
                    <li key={index} className={feature.included ? 'feature-included' : 'feature-excluded'}>
                      <span className="feature-icon">
                        {feature.included ? '✓' : '✗'}
                      </span>
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/register"
                  className={`btn ${plan.buttonVariant === 'primary' ? 'btn-primary' : 'btn-outline-teal'} btn-lg btn-block`}
                >
                  {plan.buttonText}
                </Link>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="plans-faq">
            <h2 className="faq-title">Câu hỏi thường gặp</h2>
            <div className="faq-grid">
              <Card variant="default" padding="lg">
                <h3 className="faq-question">💳 Thanh toán như thế nào?</h3>
                <p className="faq-answer">
                  Chúng tôi chấp nhận thẻ tín dụng, thẻ ATM nội địa, ví điện tử (Momo, ZaloPay) và chuyển khoản ngân hàng.
                </p>
              </Card>

              <Card variant="default" padding="lg">
                <h3 className="faq-question">🔄 Có thể đổi gói không?</h3>
                <p className="faq-answer">
                  Có, bạn có thể nâng cấp hoặc hạ cấp gói bất cứ lúc nào. Chênh lệch sẽ được tính vào chu kỳ tiếp theo.
                </p>
              </Card>

              <Card variant="default" padding="lg">
                <h3 className="faq-question">❌ Hủy dịch vụ có mất phí không?</h3>
                <p className="faq-answer">
                  Không, bạn có thể hủy bất cứ lúc nào mà không mất phí. Dịch vụ sẽ còn hiệu lực đến hết chu kỳ thanh toán.
                </p>
              </Card>

              <Card variant="default" padding="lg">
                <h3 className="faq-question">🔒 Thông tin có được bảo mật?</h3>
                <p className="faq-answer">
                  Tuyệt đối. Chúng tôi sử dụng mã hóa AES-256 và tuân thủ GDPR, HIPAA. Không chia sẻ dữ liệu với bên thứ ba.
                </p>
              </Card>

              <Card variant="default" padding="lg">
                <h3 className="faq-question">👨‍⚕️ Bác sĩ có chuyên môn không?</h3>
                <p className="faq-answer">
                  Có, tất cả bác sĩ đều có chứng chỉ hành nghề, tối thiểu 3 năm kinh nghiệm và được đào tạo về CBT, DBT.
                </p>
              </Card>

              <Card variant="default" padding="lg">
                <h3 className="faq-question">📱 Có app mobile không?</h3>
                <p className="faq-answer">
                  Có, ứng dụng MindCare AI có sẵn trên iOS và Android. Đồng bộ hoàn toàn với phiên bản web.
                </p>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="plans-cta">
            <Card variant="elevated" padding="xl">
              <div className="cta-content-plans">
                <div className="cta-icon">💬</div>
                <h2>Vẫn chưa chắc chắn?</h2>
                <p>Liên hệ với đội ngũ tư vấn để được hỗ trợ lựa chọn gói phù hợp nhất</p>
                <div className="cta-actions">
                  <Link to="/contact" className="btn btn-primary btn-lg">
                    Liên hệ tư vấn
                  </Link>
                  <Link to="/chat" className="btn btn-outline-teal btn-lg">
                    Dùng thử ngay
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPlans;
