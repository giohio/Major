import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Bell, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface AlertItem {
  id: number;
  type: 'critical' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

const AlertPage = () => {
  const alerts: AlertItem[] = [
    {
      id: 1,
      type: 'critical',
      title: 'Cần chú ý ngay',
      message: 'Mức độ lo lắng của bạn tăng cao trong 3 ngày qua. Chúng tôi khuyên bạn nên liên hệ bác sĩ.',
      timestamp: '2024-01-20 14:30',
      read: false,
      actionUrl: '/user/find-doctor'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Lịch hẹn sắp tới',
      message: 'Bạn có lịch hẹn với Dr. Nguyễn Văn An vào 2:00 PM hôm nay. Vui lòng chuẩn bị sẵn sàng.',
      timestamp: '2024-01-20 12:00',
      read: false,
      actionUrl: '/user/appointments'
    },
    {
      id: 3,
      type: 'info',
      title: 'Bài tập mới',
      message: 'Chúng tôi đã thêm bài tập "Thiền Chánh Niệm Nâng Cao" phù hợp với tiến trình của bạn.',
      timestamp: '2024-01-19 18:00',
      read: true,
      actionUrl: '/user/exercises'
    },
    {
      id: 4,
      type: 'success',
      title: 'Tiến triển tốt',
      message: 'Chúc mừng! Bạn đã hoàn thành 7 ngày liên tiếp thực hành bài tập tâm lý.',
      timestamp: '2024-01-19 09:00',
      read: true
    },
    {
      id: 5,
      type: 'warning',
      title: 'Gói Premium sắp hết hạn',
      message: 'Gói Premium của bạn sẽ hết hạn trong 3 ngày. Gia hạn ngay để tiếp tục sử dụng đầy đủ tính năng.',
      timestamp: '2024-01-18 10:00',
      read: true,
      actionUrl: '/plans'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
        return <Info className="w-5 h-5" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 text-white shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Bell className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-2">Cảnh Báo & Thông Báo</h1>
                <p className="text-white/90 text-lg">
                  Theo dõi các thông báo quan trọng về sức khỏe tâm lý của bạn
                </p>
              </div>
            </div>
            {unreadCount > 0 && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <Badge className="text-lg px-5 py-2 bg-white text-purple-600 hover:bg-white/90 shadow-lg">
                  {unreadCount} thông báo mới
                </Badge>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-white dark:from-red-950/20 dark:to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                </div>
                <span className="text-red-700 dark:text-red-300">Quan trọng</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {alerts.filter(a => a.type === 'critical').length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-yellow-50 to-white dark:from-yellow-950/20 dark:to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <span className="text-yellow-700 dark:text-yellow-300">Cảnh báo</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {alerts.filter(a => a.type === 'warning').length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-blue-700 dark:text-blue-300">Thông tin</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {alerts.filter(a => a.type === 'info').length}
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-green-50 to-white dark:from-green-950/20 dark:to-background">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-green-700 dark:text-green-300">Tích cực</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {alerts.filter(a => a.type === 'success').length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Alerts List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <div
                className={`relative rounded-xl border p-4 transition-all duration-300 hover:shadow-md ${alert.type === 'critical'
                  ? 'bg-red-50/50 border-red-200 dark:bg-red-950/10 dark:border-red-900/50'
                  : alert.type === 'warning'
                    ? 'bg-yellow-50/50 border-yellow-200 dark:bg-yellow-950/10 dark:border-yellow-900/50'
                    : alert.type === 'success'
                      ? 'bg-green-50/50 border-green-200 dark:bg-green-950/10 dark:border-green-900/50'
                      : 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/10 dark:border-blue-900/50'
                  } ${!alert.read ? 'border-l-4' : 'opacity-80'}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 mt-1 p-2 rounded-full ${alert.type === 'critical' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                    alert.type === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      alert.type === 'success' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                    }`}>
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-semibold text-foreground">
                            {alert.title}
                          </h3>
                          {!alert.read && (
                            <Badge className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0">Mới</Badge>
                          )}
                        </div>
                        <p className="text-base text-muted-foreground leading-relaxed">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                          <span className="flex items-center gap-1 bg-background/50 px-2 py-1 rounded-md border">
                            <Info className="w-3 h-3" />
                            {new Date(alert.timestamp).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="flex-shrink-0 hover:bg-destructive/10 hover:text-destructive transition-colors -mt-1 -mr-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    {alert.actionUrl && (
                      <div className="pt-1">
                        <Button
                          variant="default"
                          size="sm"
                          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-sm h-8"
                        >
                          Xem chi tiết →
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {alerts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 shadow-lg">
              <CardContent className="py-16 text-center">
                <div className="p-6 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Tuyệt vời!</h3>
                <p className="text-muted-foreground text-lg">
                  Bạn không có thông báo nào cần xử lý
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AlertPage;
