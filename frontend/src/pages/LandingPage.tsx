import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { MessageCircle, Users, Activity, Calendar, Lock, Brain, ArrowRight, Star } from 'lucide-react';
import { useTheme } from '../contexts/ThemeProvider';
import { useState, useEffect } from 'react';

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full min-h-screen bg-background overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-500/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[100px] animate-pulse animation-delay-2000" />
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm' : 'bg-transparent border-transparent'}`}>
        <div className="w-full px-6 md:px-8 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform duration-300">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">MindCare AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2.5 hover:bg-muted rounded-full transition-all duration-300 hover:rotate-12"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <Link to="/login" className="hidden sm:block">
              <Button variant="ghost" className="text-base hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400">Đăng nhập</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full px-6 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all hover:scale-105">
                Bắt đầu ngay
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 min-h-screen flex items-center justify-center z-10">
        <div className="max-w-7xl mx-auto w-full text-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-purple-200 dark:border-purple-800 shadow-sm hover:shadow-md transition-all cursor-default">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Trợ lý sức khỏe tâm lý AI hàng đầu</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold leading-tight tracking-tight">
              <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent animate-gradient-x">
                Chăm sóc tâm lý
              </span>
              <br />
              <span className="text-foreground relative">
                trong tầm tay bạn
                <svg className="absolute w-full h-3 -bottom-1 left-0 text-purple-500/30 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Kết nối với AI chatbot thấu hiểu, bác sĩ chuyên khoa tận tâm và công cụ theo dõi cảm xúc thông minh.
              <span className="block mt-2 font-medium text-foreground">An toàn. Bảo mật. Luôn bên bạn 24/7.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-lg rounded-full h-14 px-10 gap-2 shadow-xl shadow-purple-500/30 transition-all hover:scale-105 hover:shadow-purple-500/50">
                  Trải nghiệm miễn phí <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg rounded-full h-14 px-10 border-2 hover:bg-muted/50 transition-all hover:scale-105 backdrop-blur-sm bg-background/50">
                Tìm hiểu thêm
              </Button>
            </div>

            {/* Hero Stats */}
            <div className="pt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { value: '50K+', label: 'Người dùng tin tưởng', color: 'from-purple-600 to-blue-600' },
                { value: '4.9/5', label: 'Đánh giá hài lòng', color: 'from-blue-600 to-cyan-600' },
                { value: '24/7', label: 'Hỗ trợ tức thì', color: 'from-cyan-600 to-purple-600' }
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 shadow-lg hover:transform hover:-translate-y-1 transition-all duration-300">
                  <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Tính năng <span className="text-purple-600">vượt trội</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Công nghệ AI tiên tiến kết hợp với chuyên môn y khoa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <Card key={i} className="group relative overflow-hidden p-8 border border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-purple-600 transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 px-6 bg-muted/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Được tin dùng bởi cộng đồng</h2>
            <div className="flex justify-center gap-1 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-6 h-6 fill-yellow-400 text-yellow-400 animate-pulse" style={{ animationDelay: `${star * 100}ms` }} />
              ))}
            </div>
            <p className="text-lg text-muted-foreground">Hơn 50,000 người đã cải thiện sức khỏe tinh thần</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Nguyễn Văn A', role: 'Nhân viên văn phòng', text: 'MindCare thực sự thay đổi cuộc sống của tôi. Việc có quyền truy cập vào hỗ trợ tâm lý bất cứ lúc nào đã giúp tôi vượt qua những thời điểm khó khăn.' },
              { name: 'Trần Thị B', role: 'Sinh viên', text: 'Chatbot AI rất thông minh và bác sĩ tư vấn nhiệt tình. Tôi cảm thấy tự tin hơn nhiều sau khi sử dụng dịch vụ.' },
              { name: 'Lê Văn C', role: 'Giáo viên', text: 'Giao diện đẹp, dễ sử dụng và quan trọng nhất là bảo mật tuyệt đối. Tôi hoàn toàn tin tưởng vào MindCare.' }
            ].map((testimonial, i) => (
              <div key={i} className="bg-background p-8 rounded-3xl border border-border/50 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-muted-foreground italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center text-purple-600 font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-black opacity-90" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />

        <div className="max-w-4xl mx-auto text-center relative z-10 text-white">
          <h2 className="text-5xl md:text-6xl font-bold mb-8 leading-tight">
            Sẵn sàng cho một tâm trí <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">khỏe mạnh hơn?</span>
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Hãy để MindCare đồng hành cùng bạn trên hành trình chăm sóc sức khỏe tinh thần. Bắt đầu ngay hôm nay, hoàn toàn miễn phí.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100 text-xl rounded-full h-16 px-12 shadow-2xl transition-transform hover:scale-105 font-bold">
                Đăng ký ngay
              </Button>
            </Link>
          </div>
          <p className="mt-8 text-sm text-gray-400">
            Không cần thẻ tín dụng • Hủy bất cứ lúc nào
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50 bg-background">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">MindCare AI</span>
          </div>
          <div className="text-sm text-muted-foreground">
            &copy; 2025 MindCare. All rights reserved.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-purple-600 transition-colors">Điều khoản</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Bảo mật</a>
            <a href="#" className="hover:text-purple-600 transition-colors">Liên hệ</a>
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
    description: 'Trò chuyện với AI thông minh, thấu hiểu cảm xúc để nhận hỗ trợ tâm lý bất cứ lúc nào, mọi nơi.'
  },
  {
    icon: <Users className="w-7 h-7 text-white" />,
    title: 'Bác sĩ chuyên khoa',
    description: 'Kết nối và tư vấn 1-1 với mạng lưới các chuyên gia tâm lý hàng đầu, giàu kinh nghiệm.'
  },
  {
    icon: <Activity className="w-7 h-7 text-white" />,
    title: 'Theo dõi cảm xúc',
    description: 'Biểu đồ trực quan giúp bạn ghi lại và nhận diện xu hướng tâm trạng của bản thân mỗi ngày.'
  },
  {
    icon: <MessageCircle className="w-7 h-7 text-white" />,
    title: 'Cộng đồng hỗ trợ',
    description: 'Tham gia vào cộng đồng an toàn, nơi bạn có thể chia sẻ và nhận được sự đồng cảm.'
  },
  {
    icon: <Calendar className="w-7 h-7 text-white" />,
    title: 'Lịch hẹn thông minh',
    description: 'Dễ dàng đặt lịch, quản lý cuộc hẹn và nhận nhắc nhở tự động để không bỏ lỡ buổi tư vấn.'
  },
  {
    icon: <Lock className="w-7 h-7 text-white" />,
    title: 'Bảo mật tuyệt đối',
    description: 'Dữ liệu của bạn được mã hóa cấp cao nhất, đảm bảo sự riêng tư và an toàn tuyệt đối.'
  }
];

export default LandingPage;
