import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { MessageCircle, Users, Activity, Calendar, Lock, Brain, ArrowRight, Star, CheckCircle2, Shield, Eye, Clock, Award, HelpCircle, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeProvider';
import { useState } from 'react';

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/75 backdrop-blur-lg border-b border-border/40">
        <div className="w-full px-8 py-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">MindCare AI</span>
          </Link>

          <div className="flex items-center gap-5">
            <button
              onClick={toggleTheme}
              className="p-3 hover:bg-muted rounded-lg transition-colors text-xl"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/login">
              <Button variant="ghost" size="default" className="text-base">Đăng nhập</Button>
            </Link>
            <Link to="/register">
              <Button size="default" className="btn-primary rounded-lg text-base">Tạo tài khoản</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="space-y-12 text-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800">
                <Brain className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-base font-medium text-purple-700 dark:text-purple-300">Powered by AI</span>
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Chăm sóc sức khỏe
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
                  tâm lý của bạn mỗi ngày
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Nói chuyện với AI chatbot 24/7, kết nối với bác sĩ chuyên khoa, và theo dõi cảm xúc của bạn. Mọi thứ đều được bảo mật và an toàn.
              </p>
            </div>

            <div className="flex gap-6 justify-center pt-8">
              <Link to="/register">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg rounded-xl h-14 px-10 gap-3 shadow-xl shadow-purple-500/30 transition-all hover:scale-105">
                  Bắt đầu miễn phí <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg rounded-xl h-14 px-10 border-2 hover:bg-muted/50 transition-all hover:scale-105">
                Tìm hiểu thêm
              </Button>
            </div>

            {/* Hero Stats */}
            <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">50K+</div>
                <div className="text-base text-muted-foreground mt-2 font-medium">Người dùng hài lòng</div>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all">
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">4.9★</div>
                <div className="text-base text-muted-foreground mt-2 font-medium">Đánh giá trên App</div>
              </div>
              <div className="p-5 rounded-2xl bg-gradient-to-br from-cyan-50 to-purple-50 dark:from-cyan-950/20 dark:to-purple-950/20 border-2 border-cyan-200 dark:border-cyan-800 hover:shadow-lg transition-all">
                <div className="text-4xl font-bold bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent">200+</div>
                <div className="text-base text-muted-foreground mt-2 font-medium">Bác sĩ chuyên khoa</div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 px-8 bg-gradient-to-b from-background to-muted/20">
        <div className="w-full px-4">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-8">
              <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-base font-medium text-green-700 dark:text-green-300">Lợi ích</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Tại sao chọn MindCare?
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
              Giải pháp chăm sóc sức khỏe tâm lý toàn diện và hiện đại
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { icon: <Clock className="w-8 h-8" />, title: 'Hỗ trợ 24/7', desc: 'Chatbot AI luôn sẵn sàng lắng nghe và hỗ trợ bạn bất cứ lúc nào, ngay cả vào lúc nửa đêm', color: 'from-blue-600 to-cyan-600' },
              { icon: <Shield className="w-8 h-8" />, title: 'Bảo mật tuyệt đối', desc: 'Dữ liệu được mã hóa end-to-end, tuân thủ HIPAA và GDPR, đảm bảo quyền riêng tư của bạn', color: 'from-purple-600 to-pink-600' },
              { icon: <Users className="w-8 h-8" />, title: 'Chuyên gia có chứng chỉ', desc: 'Đội ngũ bác sĩ tâm lý, tư vấn viên được đào tạo bài bản và có kinh nghiệm nhiều năm', color: 'from-orange-600 to-red-600' },
              { icon: <Activity className="w-8 h-8" />, title: 'Theo dõi tiến trình', desc: 'Báo cáo chi tiết về cảm xúc, tâm trạng và sự tiến bộ của bạn theo thời gian', color: 'from-green-600 to-teal-600' }
            ].map((benefit, i) => (
              <div key={i} className="group p-6 rounded-2xl border-2 border-border bg-background hover:shadow-2xl transition-all hover:-translate-y-2">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-8 border-t border-border/50">
        <div className="w-full px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Tính năng</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Những gì bạn nhận được
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Một nền tảng toàn diện để chăm sóc sức khỏe tâm lý của bạn
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="group card-soft card-hover p-8 border-2 transition-all hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4 group-hover:text-purple-600 transition-colors">{feature.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-32 px-8 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Người dùng nói gì về chúng tôi
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Nguyễn Văn A', role: 'Nhân viên văn phòng', text: 'MindCare thực sự thay đổi cuộc sống của tôi. Việc có quyền truy cập vào hỗ trợ tâm lý bất cứ lúc nào đã giúp tôi vượt qua những thời điểm khó khăn.' },
              { name: 'Trần Thị B', role: 'Sinh viên', text: 'Chatbot AI rất thông minh và bác sĩ tư vấn nhiệt tình. Tôi cảm thấy tự tin hơn nhiều sau khi sử dụng dịch vụ.' },
              { name: 'Lê Văn C', role: 'Giáo viên', text: 'Giao diện đẹp, dễ sử dụng và quan trọng nhất là bảo mật tuyệt đối. Tôi hoàn toàn tin tưởng vào MindCare.' }
            ].map((testimonial, i) => (
              <div key={i} className="bg-background border-2 border-border rounded-2xl p-6 space-y-4 hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="flex justify-start gap-1">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-base text-muted-foreground italic leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="pt-4 border-t border-border">
                  <p className="font-bold text-foreground text-lg">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground mt-1">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-32 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 mb-6">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Cách thức hoạt động</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Bắt đầu chỉ với 3 bước đơn giản
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', title: 'Đăng ký tài khoản', desc: 'Tạo tài khoản miễn phí chỉ trong vài phút', icon: '👤' },
              { step: '02', title: 'Chọn dịch vụ phù hợp', desc: 'Chat với AI, đặt lịch bác sĩ hoặc theo dõi cảm xúc', icon: '🎯' },
              { step: '03', title: 'Bắt đầu cải thiện', desc: 'Trải nghiệm sự thay đổi tích cực trong cuộc sống', icon: '🚀' }
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-bold text-purple-200 dark:text-purple-900/30 absolute -top-6 -left-4 -z-10">{item.step}</div>
                <div className="text-5xl mb-6">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4">{item.title}</h3>
                <p className="text-base text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-32 px-8 bg-gradient-to-b from-muted/30 to-background border-t border-border/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Gói dịch vụ linh hoạt
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground">Lựa chọn phù hợp với nhu cầu của bạn</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Miễn phí', price: '0đ', features: ['Chat AI cơ bản', 'Theo dõi cảm xúc', 'Cộng đồng hỗ trợ'], highlight: false },
              { name: 'Premium', price: '199k/tháng', features: ['Chat AI không giới hạn', 'Đặt lịch bác sĩ', 'Video call', 'Báo cáo chi tiết'], highlight: true },
              { name: 'Doanh nghiệp', price: 'Liên hệ', features: ['Tất cả tính năng Premium', 'Quản lý nhóm', 'API tích hợp', 'Hỗ trợ ưu tiên'], highlight: false }
            ].map((plan, i) => (
              <div key={i} className={`relative rounded-2xl p-8 border-2 transition-all hover:shadow-2xl hover:-translate-y-2 ${
                plan.highlight 
                  ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white border-transparent shadow-xl shadow-purple-500/30' 
                  : 'bg-background border-border'
              }`}>
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-400 text-black text-sm font-bold rounded-full">
                    PHỔ BIẾN NHẤT
                  </div>
                )}
                <h3 className={`text-2xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-foreground'}`}>{plan.name}</h3>
                <div className="mb-6">
                  <span className={`text-5xl font-bold ${plan.highlight ? 'text-white' : 'text-purple-600'}`}>{plan.price}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className={`flex items-center gap-2 text-base ${plan.highlight ? 'text-purple-100' : 'text-muted-foreground'}`}>
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className={`w-full h-12 text-base ${
                  plan.highlight 
                    ? 'bg-white text-purple-600 hover:bg-purple-50' 
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                }`}>
                  {plan.price === 'Liên hệ' ? 'Liên hệ ngay' : 'Chọn gói'}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-32 px-8 border-t border-border/50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 mb-8">
              <HelpCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <span className="text-base font-medium text-yellow-700 dark:text-yellow-300">FAQ</span>
            </div>
            <h2 className="text-6xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Câu hỏi thường gặp
              </span>
            </h2>
          </div>
          <div className="space-y-4">
            {[
              { q: 'MindCare có miễn phí không?', a: 'Có! Chúng tôi cung cấp gói miễn phí với các tính năng cơ bản như chat AI và theo dõi cảm xúc. Bạn có thể nâng cấp lên gói Premium hoặc Professional để trải nghiệm đầy đủ tính năng.' },
              { q: 'Thông tin của tôi có được bảo mật không?', a: 'Tuyệt đối! Tất cả dữ liệu được mã hóa end-to-end, tuân thủ HIPAA và GDPR. Chúng tôi không bao giờ chia sẻ thông tin cá nhân của bạn với bên thứ ba mà không có sự đồng ý.' },
              { q: 'Tôi có thể đặt lịch với bác sĩ thật không?', a: 'Có! Với gói Premium và Professional, bạn có thể đặt lịch tư vấn trực tuyến với các bác sĩ tâm lý được chứng nhận. Chúng tôi có hơn 200+ chuyên gia sẵn sàng hỗ trợ bạn.' },
              { q: 'AI chatbot có thay thế được bác sĩ thật không?', a: 'Không. AI chatbot là công cụ hỗ trợ ban đầu, giúp bạn hiểu rõ hơn về cảm xúc và cung cấp các kỹ thuật tự chăm sóc. Đối với các vấn đề nghiêm trọng, chúng tôi luôn khuyến khích gặp bác sĩ chuyên khoa.' }
            ].map((faq, i) => (
              <div key={i} className="border-2 border-border rounded-2xl overflow-hidden bg-background hover:shadow-lg transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                >
                  <span className="text-xl font-bold pr-4">{faq.q}</span>
                  <ChevronDown className={`w-6 h-6 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-base text-muted-foreground leading-relaxed border-t border-border pt-6">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Security Section */}
      <section className="py-32 px-8 bg-gradient-to-b from-background to-muted/20 border-t border-border/50">
        <div className="w-full px-4">
          <div className="text-center mb-20">
            <h2 className="text-6xl md:text-7xl font-bold mb-8">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Bảo mật & Tin cậy
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground">
              Cam kết bảo vệ thông tin và quyền riêng tư của bạn
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <Shield className="w-10 h-10" />, title: 'Mã hóa End-to-End', desc: 'Dữ liệu được bảo vệ với tiêu chuẩn ngân hàng' },
              { icon: <Eye className="w-10 h-10" />, title: 'Quyền riêng tư', desc: 'Bạn kiểm soát hoàn toàn dữ liệu của mình' },
              { icon: <Lock className="w-10 h-10" />, title: 'Tuân thủ HIPAA', desc: 'Đáp ứng tiêu chuẩn y tế quốc tế' },
              { icon: <CheckCircle2 className="w-10 h-10" />, title: 'Chứng nhận ISO', desc: 'Được kiểm định bởi tổ chức độc lập' }
            ].map((item, i) => (
              <div key={i} className="text-center p-6 rounded-2xl border-2 border-border bg-background hover:shadow-xl transition-all hover:-translate-y-2">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-base text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-32 px-8 border-t border-border/50">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          <div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Sẵn sàng bắt đầu hành trình chăm sóc tâm lý?
              </span>
            </h2>
            <p className="text-2xl text-muted-foreground">
              Tham gia hàng ngàn người đã cải thiện sức khỏe tâm lý của họ với MindCare
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-xl rounded-xl h-20 px-16 gap-3 shadow-xl shadow-purple-500/30 transition-all hover:scale-105">
                Đăng ký miễn phí <ArrowRight className="w-6 h-6" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="text-xl rounded-xl h-20 px-16 border-2">
                Đăng nhập
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground pt-4">
            ✓ Không cần thẻ tín dụng • ✓ Hủy bất cứ lúc nào • ✓ Hỗ trợ 24/7
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-12 px-8 bg-muted/30">
        <div className="w-full px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">MindCare AI</span>
              </div>
              <p className="text-sm text-muted-foreground">Chăm sóc sức khỏe tâm lý với AI</p>
            </div>
            {[
              { title: 'Sản phẩm', links: ['Chatbot AI', 'Bác sĩ', 'Video Call'] },
              { title: 'Công ty', links: ['Về chúng tôi', 'Blog', 'Liên hệ'] },
              { title: 'Hỗ trợ', links: ['FAQ', 'Tài liệu', 'Trạng thái'] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4 text-foreground">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
            <p>&copy; 2025 MindCare. Tất cả quyền được bảo lưu.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Điều khoản</a>
              <a href="#" className="hover:text-foreground transition-colors">Riêng tư</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const features = [
  {
    icon: <Brain className="w-7 h-7 text-white" />,
    title: 'AI Chatbot 24/7',
    description: 'Trò chuyện với AI thông minh để nhận hỗ trợ tâm lý bất cứ lúc nào'
  },
  {
    icon: <Users className="w-7 h-7 text-white" />,
    title: 'Bác sĩ chuyên khoa',
    description: 'Tư vấn 1-1 với các chuyên gia tâm lý có kinh nghiệm'
  },
  {
    icon: <Activity className="w-7 h-7 text-white" />,
    title: 'Theo dõi cảm xúc',
    description: 'Ghi nhận và phân tích xu hướng tâm trạng hàng ngày'
  },
  {
    icon: <MessageCircle className="w-7 h-7 text-white" />,
    title: 'Cuộc gọi video',
    description: 'Tư vấn trực tiếp qua video với các bác sĩ'
  },
  {
    icon: <Calendar className="w-7 h-7 text-white" />,
    title: 'Lịch hẹn dễ dàng',
    description: 'Đặt lịch và quản lý cuộc hẹn theo thời gian của bạn'
  },
  {
    icon: <Lock className="w-7 h-7 text-white" />,
    title: 'An toàn & Bảo mật',
    description: 'Dữ liệu được mã hóa end-to-end hoàn toàn bảo vệ'
  }
];

export default LandingPage;
