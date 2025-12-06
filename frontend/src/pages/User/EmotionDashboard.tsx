import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { TrendingUp, TrendingDown, Minus, Brain, Clock, BarChart3, Smile, AlertCircle, Lightbulb } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import type { EmotionStats, UserStats } from '../../types/api.types';

type TimeRange = 'week' | 'month' | 'year';

const EmotionDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [emotionStats, setEmotionStats] = useState<EmotionStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [emotions, stats] = await Promise.all([
          apiClient.get<EmotionStats>(`${API_ENDPOINTS.USERS.EMOTIONS}?period=${timeRange}`),
          apiClient.get<UserStats>(API_ENDPOINTS.USERS.STATS)
        ]);
        setEmotionStats(emotions);
        setUserStats(stats);
      } catch (error) {
        console.error('Failed to load emotion data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeRange]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Đang tải...</div>;
  }

  const moodScore = emotionStats?.average_sentiment || 7.2;
  const trend = emotionStats?.trend === 'improving' ? '+12%' : emotionStats?.trend === 'declining' ? '-8%' : '0%';
  const totalSessions = userStats?.total_chat_sessions || 0;
  const averageSessionTime = '32 phút';

  // Emotion distribution data (currently using hardcoded values for visualization)
  // const emotions = [
  //   { name: 'Vui vẻ', value: 35, color: 'bg-green-500', icon: '😊' },
  //   { name: 'Bình thường', value: 40, color: 'bg-yellow-500', icon: '😐' },
  //   { name: 'Lo lắng', value: 15, color: 'bg-red-500', icon: '😰' },
  //   { name: 'Buồn bã', value: 10, color: 'bg-purple-500', icon: '😢' }
  // ];

  const weeklyData = [
    { date: '06/11', happiness: 65, anxiety: 35, stress: 40 },
    { date: '07/11', happiness: 70, anxiety: 30, stress: 35 },
    { date: '08/11', happiness: 75, anxiety: 28, stress: 32 },
    { date: '09/11', happiness: 72, anxiety: 32, stress: 38 },
    { date: '10/11', happiness: 80, anxiety: 25, stress: 28 },
    { date: '11/11', happiness: 85, anxiety: 20, stress: 25 },
    { date: '12/11', happiness: 82, anxiety: 22, stress: 27 }
  ];

  const insights = [
    {
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Xu hướng tích cực',
      description: 'Tâm trạng của bạn đang cải thiện dần trong tuần qua',
      variant: 'default' as const
    },
    {
      icon: <AlertCircle className="w-5 h-5" />,
      title: 'Cần chú ý',
      description: 'Mức độ lo lắng tăng nhẹ vào giữa tuần',
      variant: 'destructive' as const
    },
    {
      icon: <Lightbulb className="w-5 h-5" />,
      title: 'Gợi ý',
      description: 'Thử bài tập thở sâu vào buổi sáng để bắt đầu ngày tốt hơn',
      variant: 'secondary' as const
    }
  ];

  const triggers = [
    { name: 'Công việc', count: 12, trend: 'up' as const },
    { name: 'Mối quan hệ', count: 8, trend: 'down' as const },
    { name: 'Sức khỏe', count: 5, trend: 'stable' as const },
    { name: 'Tài chính', count: 3, trend: 'stable' as const },
    { name: 'Gia đình', count: 6, trend: 'up' as const },
    { name: 'Giấc ngủ', count: 4, trend: 'down' as const }
  ];

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Page Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-green-600 via-teal-600 to-blue-600 p-8 text-white shadow-2xl">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                <Brain className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Dashboard Cảm Xúc</h1>
                <p className="text-teal-100 mt-1 text-lg">
                  Theo dõi và phân tích trạng thái tinh thần của bạn
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeRange === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange('week')}
                className="bg-white/20 hover:bg-white/30"
              >
                7 ngày
              </Button>
              <Button
                variant={timeRange === 'month' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange('month')}
                className="bg-white/20 hover:bg-white/30"
              >
                30 ngày
              </Button>
              <Button
                variant={timeRange === 'year' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange('year')}
                className="bg-white/20 hover:bg-white/30"
              >
                1 năm
              </Button>
            </div>
          </div>
          
          {/* Quick Stats in Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Smile className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-teal-100 font-medium">Điểm Tâm Trạng</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold mt-1">{moodScore}</p>
                    <p className="text-xs text-green-200 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {trend}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-teal-100 font-medium">Tổng Phiên</p>
                  <p className="text-2xl font-bold mt-1">{totalSessions}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-teal-100 font-medium">Thời Gian TB</p>
                  <p className="text-2xl font-bold mt-1">{averageSessionTime}</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-white/20">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm text-teal-100 font-medium">Trạng Thái</p>
                  <p className="text-2xl font-bold mt-1">Tốt</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <Card className="lg:col-span-2 shadow-lg border-0">
          <CardHeader className="border-b bg-linear-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500 text-white">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Xu hướng cảm xúc (7 ngày)</CardTitle>
                <CardDescription className="text-base">Theo dõi cảm xúc trong 7 ngày qua</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="anxiety" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="anxiety"
                />
                <Line 
                  type="monotone" 
                  dataKey="happiness" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                  name="happiness"
                />
                <Line 
                  type="monotone" 
                  dataKey="stress" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', r: 4 }}
                  name="stress"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Emotion Distribution */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-linear-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500 text-white">
                <Smile className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Phân Bố Cảm Xúc</CardTitle>
                <CardDescription className="text-base">Tỷ lệ các cảm xúc trong khoảng thời gian đã chọn</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center justify-center gap-8 h-full">
              {/* Donut Chart */}
              <div className="relative w-56 h-56">
                <svg viewBox="0 0 200 200" className="transform -rotate-90">
                  {/* Hạnh phúc - Green - 42% */}
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="transparent"
                    stroke="#22c55e"
                    strokeWidth="35"
                    strokeDasharray={`${42 * 4.4} 440`}
                    strokeDashoffset="0"
                    className="transition-all"
                  />
                  {/* Bình thường - Yellow - 35% */}
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="transparent"
                    stroke="#eab308"
                    strokeWidth="35"
                    strokeDasharray={`${35 * 4.4} 440`}
                    strokeDashoffset={`-${42 * 4.4}`}
                    className="transition-all"
                  />
                  {/* Căng thẳng - Red - 18% */}
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="transparent"
                    stroke="#ef4444"
                    strokeWidth="35"
                    strokeDasharray={`${18 * 4.4} 440`}
                    strokeDashoffset={`-${(42 + 35) * 4.4}`}
                    className="transition-all"
                  />
                  {/* Buồn - Purple - 5% */}
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill="transparent"
                    stroke="#a855f7"
                    strokeWidth="35"
                    strokeDasharray={`${5 * 4.4} 440`}
                    strokeDashoffset={`-${(42 + 35 + 18) * 4.4}`}
                    className="transition-all"
                  />
                </svg>
              </div>

              {/* Legend */}
              <div className="w-full space-y-3 px-4">
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-green-500 shadow-sm" />
                    <span className="text-sm font-medium">Hạnh phúc</span>
                  </div>
                  <span className="text-base font-bold">42%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-500 shadow-sm" />
                    <span className="text-sm font-medium">Bình thường</span>
                  </div>
                  <span className="text-base font-bold">35%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border/50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500 shadow-sm" />
                    <span className="text-sm font-medium">Căng thẳng</span>
                  </div>
                  <span className="text-base font-bold">18%</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-purple-500 shadow-sm" />
                    <span className="text-sm font-medium">Buồn</span>
                  </div>
                  <span className="text-base font-bold">5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Triggers */}
        <Card className="shadow-lg border-0">
          <CardHeader className="border-b bg-linear-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500 text-white">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-xl">Yếu Tố Ảnh Hưởng</CardTitle>
                <CardDescription className="text-base">Những yếu tố tác động đến tâm trạng</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col justify-center h-full space-y-6">
              {triggers.map((trigger, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg hover:bg-accent/50 transition-colors border border-border/50">
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold">{trigger.name}</span>
                    <span className="text-sm text-muted-foreground">{trigger.count} lần</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {trigger.trend === 'up' && (
                      <TrendingUp className="w-6 h-6 text-red-500" />
                    )}
                    {trigger.trend === 'down' && (
                      <TrendingDown className="w-6 h-6 text-green-500" />
                    )}
                    {trigger.trend === 'stable' && (
                      <Minus className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card className="shadow-lg border-0">
        <CardHeader className="border-b bg-linear-to-r from-teal-50 to-green-50 dark:from-teal-950/20 dark:to-green-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500 text-white">
              <Lightbulb className="w-5 h-5" />
            </div>
            <CardTitle className="text-xl">Nhận Xét & Gợi Ý</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {insights.map((insight, index) => (
              <div key={index} className="p-4 rounded-xl border-2 hover:shadow-md transition-shadow">
                <div className="flex gap-3">
                  <div className="shrink-0 p-2 rounded-lg bg-accent">
                    {insight.icon}
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{insight.title}</h4>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmotionDashboard;
