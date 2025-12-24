import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Users, Calendar, TrendingUp, TrendingDown, AlertCircle, Clock, FileText, ArrowLeft, Loader2 } from 'lucide-react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';

interface Patient {
  id: number;
  full_name: string;
  email: string;
  phone?: string;
  date_of_birth?: string;
  created_at: string;
  age?: number;
  gender?: string;
}

interface EmotionData {
  date: string;
  anxiety: number;
  depression: number;
  stress: number;
}

interface Session {
  id: number;
  date: string;
  type: string;
  duration: string;
  notes: string;
}

const PatientProfile = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [emotionHistory, setEmotionHistory] = useState<EmotionData[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    if (patientId) {
      loadPatientData();
    }
  }, [patientId]);

  // Emotion mapping: convert emotion strings to numeric scores
  const emotionToScores = (emotion: string | null) => {
    const emotionMap: Record<string, { anxiety: number; depression: number; stress: number }> = {
      'sad': { anxiety: 40, depression: 85, stress: 50 },
      'very_sad': { anxiety: 50, depression: 95, stress: 60 },
      'anxious': { anxiety: 90, depression: 45, stress: 75 },
      'very_anxious': { anxiety: 95, depression: 55, stress: 85 },
      'stressed': { anxiety: 65, depression: 40, stress: 90 },
      'very_stressed': { anxiety: 70, depression: 50, stress: 95 },
      'angry': { anxiety: 55, depression: 35, stress: 80 },
      'very_angry': { anxiety: 65, depression: 45, stress: 90 },
      'worried': { anxiety: 75, depression: 50, stress: 70 },
      'fearful': { anxiety: 85, depression: 60, stress: 65 },
      'frustrated': { anxiety: 60, depression: 55, stress: 75 },
      'overwhelmed': { anxiety: 80, depression: 70, stress: 95 },
      'hopeless': { anxiety: 50, depression: 95, stress: 60 },
      'lonely': { anxiety: 45, depression: 80, stress: 40 },
      'happy': { anxiety: 15, depression: 10, stress: 15 },
      'very_happy': { anxiety: 10, depression: 5, stress: 10 },
      'calm': { anxiety: 20, depression: 15, stress: 20 },
      'relaxed': { anxiety: 15, depression: 12, stress: 15 },
      'content': { anxiety: 18, depression: 10, stress: 18 },
      'excited': { anxiety: 25, depression: 8, stress: 30 },
      'grateful': { anxiety: 12, depression: 8, stress: 12 },
      'hopeful': { anxiety: 20, depression: 15, stress: 20 },
      'neutral': { anxiety: 30, depression: 25, stress: 30 },
      'confused': { anxiety: 55, depression: 40, stress: 50 },
      'tired': { anxiety: 35, depression: 45, stress: 55 },
      'bored': { anxiety: 25, depression: 40, stress: 25 },
    };
    
    return emotionMap[emotion?.toLowerCase() || 'neutral'] || { anxiety: 30, depression: 25, stress: 30 };
  };

  const loadPatientData = async () => {
    try {
      setLoading(true);
      
      // Fetch patient details
      const response = await apiClient.get<any>(API_ENDPOINTS.DOCTOR.GET_PATIENT(Number(patientId)));
      
      console.log('Patient API Response:', response);
      
      // Backend returns { patient, record, emotion_logs, alerts, notes, tasks, sessions }
      if (response.patient) {
        setPatient(response.patient);
        
        // Use real sessions if available
        if (response.sessions && response.sessions.length > 0) {
          const formattedSessions = response.sessions.map((s: any) => ({
            id: s.id,
            date: s.created_at || s.start_time,
            type: s.session_type || 'Video',
            duration: `${s.duration_minutes || 45} phút`,
            notes: s.ai_summary || s.notes || 'No notes available'
          }));
          setSessions(formattedSessions);
        } else {
          // Fallback sample data
          setSessions([
            {
              id: 1,
              date: '2024-01-20',
              type: 'Video',
              duration: '45 phút',
              notes: 'Bệnh nhân cho thấy tiến triển tốt trong việc quản lý cảm xúc. Tiếp tục với bài tập thở.'
            }
          ]);
        }
        
        // Transform real emotion logs into chart data
        if (response.emotion_logs && response.emotion_logs.length > 0) {
          const emotionData = response.emotion_logs
            .slice(-30) // Take last 30 emotion logs
            .map((log: any) => {
              const date = new Date(log.created_at);
              const scores = emotionToScores(log.emotion);
              return {
                date: `${date.getMonth() + 1}/${date.getDate()}`,
                fullDate: date,
                ...scores,
                emotion: log.emotion,
                risk_level: log.risk_level
              };
            })
            .sort((a: any, b: any) => a.fullDate.getTime() - b.fullDate.getTime());
          
          // Group by date and average scores
          const groupedData: Record<string, { anxiety: number[]; depression: number[]; stress: number[]; count: number }> = {};
          
          emotionData.forEach((item: any) => {
            if (!groupedData[item.date]) {
              groupedData[item.date] = { anxiety: [], depression: [], stress: [], count: 0 };
            }
            groupedData[item.date].anxiety.push(item.anxiety);
            groupedData[item.date].depression.push(item.depression);
            groupedData[item.date].stress.push(item.stress);
            groupedData[item.date].count++;
          });
          
          // Calculate averages and format for chart
          const chartData = Object.entries(groupedData).map(([date, scores]) => ({
            date,
            anxiety: Math.round(scores.anxiety.reduce((a, b) => a + b, 0) / scores.count),
            depression: Math.round(scores.depression.reduce((a, b) => a + b, 0) / scores.count),
            stress: Math.round(scores.stress.reduce((a, b) => a + b, 0) / scores.count)
          }));
          
          setEmotionHistory(chartData.slice(-7)); // Show last 7 days
        } else {
          // No emotion data available - use sample data for demo
          setEmotionHistory([
            { date: '01/15', anxiety: 78, depression: 45, stress: 62 },
            { date: '01/16', anxiety: 72, depression: 42, stress: 58 },
            { date: '01/17', anxiety: 68, depression: 40, stress: 55 },
            { date: '01/18', anxiety: 65, depression: 38, stress: 52 },
            { date: '01/19', anxiety: 60, depression: 35, stress: 48 },
            { date: '01/20', anxiety: 55, depression: 32, stress: 45 }
          ]);
        }
      }
    } catch (error: any) {
      console.error('Error loading patient:', error);
      toast.error(error.error || error.message || 'Không thể tải thông tin bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Không tìm thấy thông tin bệnh nhân</p>
        <Button onClick={() => navigate('/doctor/patients')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const calculateAge = (dob: string | undefined) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const age = patient.date_of_birth ? calculateAge(patient.date_of_birth) : 'N/A';
  const latestEmotion = emotionHistory[emotionHistory.length - 1];
  const previousEmotion = emotionHistory[emotionHistory.length - 2];
  const anxietyChange = latestEmotion && previousEmotion ? latestEmotion.anxiety - previousEmotion.anxiety : 0;

  const treatmentPlan = [
    { task: 'Thực hành thiền chánh niệm hàng ngày', progress: 85, status: 'active' },
    { task: 'Bài tập hơi thở sâu 3 lần/ngày', progress: 70, status: 'active' },
    { task: 'Ghi nhật ký cảm xúc', progress: 60, status: 'active' },
    { task: 'Tham gia nhóm hỗ trợ', progress: 30, status: 'pending' }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/doctor/patients')}
            className="mt-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="w-10 h-10 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{patient.full_name}</h1>
            <p className="text-muted-foreground mt-1">
              {age} tuổi • {patient.gender || 'N/A'} • ID: #{patient.id}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">Bệnh nhân</Badge>
              {emotionHistory.length > 0 && latestEmotion.anxiety > 70 && (
                <Badge variant="destructive">Mức độ: Cao</Badge>
              )}
              {anxietyChange < 0 && (
                <Badge className="bg-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Improving
                </Badge>
              )}
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
              {new Date(patient.created_at).toLocaleDateString('vi-VN')}
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

        {emotionHistory.length > 0 && (
          <>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lo âu hiện tại
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-lg font-bold">{latestEmotion.anxiety}/100</div>
                  {previousEmotion && (
                    <div className={`text-sm flex items-center ${anxietyChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {anxietyChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                      {Math.abs(anxietyChange)}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Treatment Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">85%</div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="sessions">Lịch sử buổi tư vấn</TabsTrigger>
          <TabsTrigger value="treatment">Treatment Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Emotion Trend Chart */}
          {emotionHistory.length > 0 && (
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
          )}

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
              {patient.phone && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="font-medium">{patient.phone}</span>
                </div>
              )}
              {patient.date_of_birth && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày sinh:</span>
                  <span className="font-medium">
                    {new Date(patient.date_of_birth).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Chưa có buổi tư vấn nào</p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
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
            ))
          )}
        </TabsContent>

        <TabsContent value="treatment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Treatment Plan</CardTitle>
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
