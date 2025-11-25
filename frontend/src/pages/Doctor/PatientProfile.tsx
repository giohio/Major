import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Users, Calendar, TrendingUp, TrendingDown, AlertCircle, Clock, FileText } from 'lucide-react';

interface EmotionData {
  date: string;
  anxiety: number;
  depression: number;
  stress: number;
}

const PatientProfile = () => {
  const patient = {
    id: 1,
    name: 'Nguyễn Văn A',
    age: 28,
    gender: 'Nam',
    email: 'nguyenvana@email.com',
    phone: '0912345678',
    joinDate: '2024-01-01',
    condition: 'Lo âu',
    severity: 'high',
    progress: 'improving'
  };

  const emotionHistory: EmotionData[] = [
    { date: '01/15', anxiety: 78, depression: 45, stress: 62 },
    { date: '01/16', anxiety: 72, depression: 42, stress: 58 },
    { date: '01/17', anxiety: 68, depression: 40, stress: 55 },
    { date: '01/18', anxiety: 65, depression: 38, stress: 52 },
    { date: '01/19', anxiety: 60, depression: 35, stress: 48 },
    { date: '01/20', anxiety: 55, depression: 32, stress: 45 }
  ];

  const sessions = [
    {
      id: 1,
      date: '2024-01-20',
      type: 'Video',
      duration: '45 phút',
      notes: 'Bệnh nhân cho thấy tiến triển tốt trong việc quản lý cảm xúc. Tiếp tục với bài tập thở.'
    },
    {
      id: 2,
      date: '2024-01-15',
      type: 'Chat',
      duration: '30 phút',
      notes: 'Thảo luận về kỹ thuật mindfulness. Bệnh nhân áp dụng tốt.'
    },
    {
      id: 3,
      date: '2024-01-10',
      type: 'Video',
      duration: '50 phút',
      notes: 'Đánh giá ban đầu. Mức độ lo âu cao, cần theo dõi sát.'
    }
  ];

  const treatmentPlan = [
    { task: 'Thực hành thiền chánh niệm hàng ngày', progress: 85, status: 'active' },
    { task: 'Bài tập hơi thở sâu 3 lần/ngày', progress: 70, status: 'active' },
    { task: 'Ghi nhật ký cảm xúc', progress: 60, status: 'active' },
    { task: 'Tham gia nhóm hỗ trợ', progress: 30, status: 'pending' }
  ];

  const latestEmotion = emotionHistory[emotionHistory.length - 1];
  const previousEmotion = emotionHistory[emotionHistory.length - 2];
  const anxietyChange = latestEmotion.anxiety - previousEmotion.anxiety;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
            <p className="text-muted-foreground mt-1">
              {patient.age} tuổi • {patient.gender} • ID: #{patient.id}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">{patient.condition}</Badge>
              <Badge variant="destructive">Mức độ: Cao</Badge>
              <Badge className="bg-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                Đang cải thiện
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Xuất báo cáo
          </Button>
          <Button>
            <Calendar className="w-4 h-4 mr-2" />
            Đặt lịch hẹn
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tham gia từ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {new Date(patient.joinDate).toLocaleDateString('vi-VN')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng buổi tư vấn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{sessions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lo âu hiện tại
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <div className="text-lg font-bold">{latestEmotion.anxiety}/100</div>
              <div className={`text-sm flex items-center ${anxietyChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                {anxietyChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {Math.abs(anxietyChange)}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tuân thủ điều trị
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">85%</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="sessions">Lịch sử buổi tư vấn</TabsTrigger>
          <TabsTrigger value="treatment">Kế hoạch điều trị</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Emotion Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Biểu Đồ Cảm Xúc</CardTitle>
              <CardDescription>Theo dõi sự thay đổi trong 7 ngày qua</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Simple Bar Chart */}
                <div className="space-y-4">
                  {emotionHistory.slice(-7).map((data, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{data.date}</span>
                        <div className="flex gap-4 text-xs">
                          <span className="text-blue-600">Lo âu: {data.anxiety}</span>
                          <span className="text-purple-600">Trầm cảm: {data.depression}</span>
                          <span className="text-orange-600">Căng thẳng: {data.stress}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-8 bg-blue-100 dark:bg-blue-950 rounded overflow-hidden">
                          <div 
                            className="h-full bg-blue-600 transition-all"
                            style={{ width: `${data.anxiety}%` }}
                          />
                        </div>
                        <div className="flex-1 h-8 bg-purple-100 dark:bg-purple-950 rounded overflow-hidden">
                          <div 
                            className="h-full bg-purple-600 transition-all"
                            style={{ width: `${data.depression}%` }}
                          />
                        </div>
                        <div className="flex-1 h-8 bg-orange-100 dark:bg-orange-950 rounded overflow-hidden">
                          <div 
                            className="h-full bg-orange-600 transition-all"
                            style={{ width: `${data.stress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Liên Hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{patient.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Số điện thoại:</span>
                <span className="font-medium">{patient.phone}</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">
                        {new Date(session.date).toLocaleDateString('vi-VN')}
                      </CardTitle>
                      <CardDescription>
                        {session.type} • {session.duration}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Chi tiết
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{session.notes}</p>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="treatment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Kế Hoạch Điều Trị</CardTitle>
              <CardDescription>Theo dõi tiến độ thực hiện</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {treatmentPlan.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.status === 'active' ? (
                        <AlertCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Clock className="w-5 h-5 text-yellow-600" />
                      )}
                      <span className="font-medium">{item.task}</span>
                    </div>
                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                      {item.progress}%
                    </Badge>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientProfile;
