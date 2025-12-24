import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { TrendingUp, TrendingDown, Minus, Brain, Clock, BarChart3, Smile, AlertCircle, Lightbulb, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';
import type { EmotionStats, UserStats, EmotionAnalysisResponse } from '../../types/api.types';

type TimeRange = 'week' | 'month' | 'year';

const EmotionDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [emotionStats, setEmotionStats] = useState<EmotionStats | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [emotionAnalysisData, setEmotionAnalysisData] = useState<EmotionAnalysisResponse | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // Load latest saved analysis first
        try {
          const latestAnalysis = await apiClient.get<EmotionAnalysisResponse>(API_ENDPOINTS.EMOTION.LATEST_ANALYSIS);
          if (latestAnalysis) {
            setEmotionAnalysisData(latestAnalysis);
          }
        } catch (err) {
          console.log('No saved analysis found, will analyze fresh');
        }

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

  const analyzeRecentChats = async () => {
    console.log('[EmotionDashboard] analyzeRecentChats started');
    try {
      setAnalyzing(true);
      console.log('[EmotionDashboard] setAnalyzing(true), sending request to', API_ENDPOINTS.EMOTION.ANALYZE_RECENT);

      // Force refresh when user manually clicks button (bypass cache)
      const response = await apiClient.post<EmotionAnalysisResponse>(API_ENDPOINTS.EMOTION.ANALYZE_RECENT, {
        limit: 15,
        force_refresh: true  // Always re-analyze when manually triggered
      });

      console.log('[EmotionDashboard] API Response received:', response);

      if (response) {
        setEmotionAnalysisData(response);
        toast.success('Updated analysis based on recent conversations');
      } else {
        console.warn('[EmotionDashboard] Response is empty/null');
      }
    } catch (error) {
      console.error('[EmotionDashboard] Failed to analyze emotions:', error);
      toast.error('Could not analyze recent sessions. Please try again.');
    } finally {
      console.log('[EmotionDashboard] analyzeRecentChats finished, setAnalyzing(false)');
      setAnalyzing(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
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





  const insightList = [
    ...(emotionAnalysisData?.summary_message ? [{
      icon: <Brain className="w-5 h-5" />,
      title: 'AI Summary',
      description: emotionAnalysisData.summary_message,
      variant: 'default' as const
    }] : []),
    ...(emotionAnalysisData?.trend === 'improving' ? [{
      icon: <TrendingUp className="w-5 h-5" />,
      title: 'Positive Trend',
      description: 'Your emotional state is showing signs of improvement.',
      variant: 'default' as const
    }] : []),
    ...(emotionAnalysisData?.session_analysis?.risk_level === 'high' ? [{
      icon: <AlertCircle className="w-5 h-5" />,
      title: 'High Risk Detected',
      description: 'Please consider reaching out to a professional.',
      variant: 'destructive' as const
    }] : [])
  ];

  if (insightList.length === 0) {
    insightList.push({
      icon: <Lightbulb className="w-5 h-5" />,
      title: 'No Insights Yet',
      description: 'Start chatting to generate insights about your emotional health.',
      variant: 'default' as const
    });
  }

  // Determine the trend color and icon dynamically
  const getTrendConfig = (trendValue: string) => {
    switch (trendValue) {
      case 'improving': return { color: 'text-emerald-500', icon: TrendingUp, bg: 'bg-emerald-500/10' };
      case 'declining': return { color: 'text-rose-500', icon: TrendingDown, bg: 'bg-rose-500/10' };
      default: return { color: 'text-amber-500', icon: Minus, bg: 'bg-amber-500/10' };
    }
  };

  const trendConfig = emotionAnalysisData ? getTrendConfig(emotionAnalysisData.trend) : { color: 'text-blue-500', icon: Minus, bg: 'bg-blue-500/10' };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-6 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-8 md:p-12 text-white shadow-2xl shadow-indigo-500/20 ring-1 ring-white/10">
          <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700" />

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium text-indigo-100">
                <Brain className="w-4 h-4" />
                <span>Mental Health AI Assistant</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-purple-100">
                Emotion Dashboard
              </h1>
              <p className="text-lg text-indigo-100/90 leading-relaxed max-w-xl">
                Track your emotional journey, gain deep insights, and visualize your mental well-being over time with our advanced AI analysis.
              </p>
            </div>

            <div className="flex gap-2 bg-white/5 p-1.5 rounded-xl backdrop-blur-md border border-white/10">
              {(['week', 'month', 'year'] as const).map((range) => (
                <Button
                  key={range}
                  variant="ghost"
                  size="sm"
                  onClick={() => setTimeRange(range)}
                  className={`capitalize px-4 transition-all duration-300 ${timeRange === range
                    ? 'bg-white text-indigo-600 shadow-lg shadow-black/5 font-semibold'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                    }`}
                >
                  {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : '1 Year'}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {[
              { icon: Smile, label: "Mood Score", value: moodScore, sub: trend, subIcon: TrendingUp, color: "text-emerald-400" },
              { icon: Clock, label: "Avg Session", value: averageSessionTime, sub: "Consistent", subIcon: Minus, color: "text-blue-400" },
              { icon: BarChart3, label: "Total Sessions", value: totalSessions, sub: "All time", subIcon: TrendingUp, color: "text-purple-400" },
              { icon: Brain, label: "Mental Status", value: "Good", sub: "Stable", subIcon: Smile, color: "text-rose-400" }
            ].map((stat, i) => (
              <div key={i} className="group bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-medium ${stat.color} bg-white/5 px-2 py-1 rounded-lg`}>
                    <stat.subIcon className="w-3 h-3" /> {stat.sub}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-indigo-100/70">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-indigo-200 transition-all">
                    {stat.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Analysis Section */}
        <div className="grid grid-cols-1 gap-8">
          <Card className="border-0 shadow-xl bg-white dark:bg-slate-900 overflow-hidden ring-1 ring-slate-900/5">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-violet-500 via-indigo-500 to-purple-500" />
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/20">
                    <Brain className="w-7 h-7" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">AI Emotion Analysis</CardTitle>
                    <CardDescription className="text-base text-slate-500 dark:text-slate-400 mt-1">
                      {analyzing ? (
                        <span className="flex items-center gap-2 text-indigo-600">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing conversations...
                        </span>
                      ) : (
                        "Real-time deep learning insights from latest sessions"
                      )}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  onClick={analyzeRecentChats}
                  disabled={analyzing}
                  size="lg"
                  className="rounded-xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-8"
                >
                  <RefreshCw className={`w-5 h-5 mr-2 ${analyzing ? 'animate-spin' : ''}`} />
                  {analyzing ? 'Processing...' : 'Run New Analysis'}
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-6 md:p-8">
              {!emotionAnalysisData ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                    <div className="relative p-6 bg-slate-50 dark:bg-slate-800 rounded-full border-2 border-dashed border-slate-200 dark:border-slate-700">
                      <Brain className="w-16 h-16 text-slate-400" />
                    </div>
                  </div>
                  <div className="max-w-md space-y-2">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Analysis Ready to Start</h3>
                    <p className="text-slate-500 dark:text-slate-400">
                      Click the button above to let our AI analyze your recent conversation patterns and generate detailed insights.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500 slide-in-from-bottom-4">

                  {/* Summary Box */}
                  {emotionAnalysisData.summary_message && (
                    <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                        <Brain className="w-32 h-32 transform rotate-12 -mr-10 -mt-10" />
                      </div>
                      <div className="flex gap-4 relative z-10">
                        <div className="p-2.5 rounded-xl bg-indigo-600/10 text-indigo-600 h-fit">
                          <Lightbulb className="w-6 h-6" />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-bold text-lg text-indigo-900 dark:text-indigo-100">Executive Summary</h3>
                          <p className="text-indigo-800/80 dark:text-indigo-200/80 leading-relaxed text-base">
                            {emotionAnalysisData.summary_message}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 3 Key Metrics Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Dominant */}
                    <div className="group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-500/30 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                          <Smile className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Dominant Emotion</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <h4 className="text-3xl font-bold text-slate-900 dark:text-white capitalize tracking-tight">
                          {emotionAnalysisData.session_analysis.dominant_emotion}
                        </h4>
                      </div>
                      <div className="mt-4 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-orange-500 rounded-full w-3/4 animate-pulse" />
                      </div>
                    </div>

                    {/* Sentiment */}
                    <div className="group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-500/30 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <BarChart3 className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Sentiment Score</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <h4 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                          {Math.round((emotionAnalysisData.session_analysis.overall_sentiment + 1) * 50)}%
                        </h4>
                        <span className="text-sm font-medium text-slate-500">positive</span>
                      </div>
                      <div className="mt-4 w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.round((emotionAnalysisData.session_analysis.overall_sentiment + 1) * 50)}%` }}
                        />
                      </div>
                    </div>

                    {/* Trend */}
                    <div className="group relative overflow-hidden p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-500/30 transition-all duration-300">
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`p-2 rounded-lg ${trendConfig.bg} ${trendConfig.color}`}>
                          <trendConfig.icon className="w-5 h-5" />
                        </div>
                        <span className="font-semibold text-slate-600 dark:text-slate-300">Current Trend</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <h4 className="text-3xl font-bold text-slate-900 dark:text-white capitalize tracking-tight">
                          {emotionAnalysisData.trend}
                        </h4>
                      </div>
                      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                        Based on recent 15 sessions
                      </p>
                    </div>
                  </div>

                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Pie Chart */}
                    <Card className="shadow-lg border-0 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                      <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <PieChart className="w-5 h-5 text-indigo-500" /> Emotion Distribution
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        <div className="h-[250px] w-full flex items-center justify-center">
                          {Object.keys(emotionAnalysisData.session_analysis.emotional_breakdown).length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={Object.entries(emotionAnalysisData.session_analysis.emotional_breakdown).map(([name, value]) => ({
                                    name: name.charAt(0).toUpperCase() + name.slice(1),
                                    value: value * 100
                                  }))}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {Object.entries(emotionAnalysisData.session_analysis.emotional_breakdown).map((_, index) => {
                                    const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];
                                    return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />;
                                  })}
                                </Pie>
                                <Tooltip
                                  formatter={(value: number) => [`${value.toFixed(1)}%`]}
                                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                  itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          ) : (
                            <div className="text-slate-400 flex flex-col items-center">
                              <Minus className="w-8 h-8 mb-2 opacity-50" /> No data
                            </div>
                          )}
                        </div>
                        {/* Custom Legend */}
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {Object.entries(emotionAnalysisData.session_analysis.emotional_breakdown).slice(0, 4).map(([emotion, value], index) => {
                            const COLORS = ['bg-violet-500', 'bg-pink-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
                            return (
                              <div key={emotion} className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${COLORS[index % COLORS.length]}`} />
                                  <span className="font-medium text-slate-600 capitalize">{emotion}</span>
                                </div>
                                <span className="font-bold text-slate-900">{Math.round((value as number) * 100)}%</span>
                              </div>
                            )
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Timeline Chart */}
                    <Card className="lg:col-span-2 shadow-lg border-0 bg-white dark:bg-slate-800 ring-1 ring-slate-200 dark:ring-slate-700">
                      <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="flex items-center gap-2 text-lg">
                          <TrendingUp className="w-5 h-5 text-emerald-500" /> Emotional Journey
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6">
                        {emotionAnalysisData.emotional_progression && emotionAnalysisData.emotional_progression.length > 0 ? (
                          <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={emotionAnalysisData.emotional_progression}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis
                                  dataKey="step"
                                  stroke="#94a3b8"
                                  tick={{ fontSize: 12 }}
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={10}
                                />
                                <YAxis
                                  stroke="#94a3b8"
                                  tick={{ fontSize: 12 }}
                                  tickLine={false}
                                  axisLine={false}
                                  tickMargin={10}
                                />
                                <Tooltip
                                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                  cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />
                                <Line
                                  type="monotone"
                                  dataKey="intensity"
                                  stroke="#8b5cf6"
                                  strokeWidth={3}
                                  dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                  activeDot={{ r: 6, strokeWidth: 0 }}
                                  name="Intensity"
                                />
                                <Line
                                  type="monotone"
                                  dataKey="sentiment"
                                  stroke="#10b981"
                                  strokeWidth={3}
                                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4, stroke: '#fff' }}
                                  activeDot={{ r: 6, strokeWidth: 0 }}
                                  name="Sentiment"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        ) : (
                          <div className="h-[300px] flex items-center justify-center text-slate-400">
                            No progression data available
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Insights Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {insightList.map((insight, index) => {
                      const isDestructive = insight.variant === 'destructive';
                      const boxClass = isDestructive
                        ? "bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30 text-rose-900 dark:text-rose-100"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100";
                      const iconBg = isDestructive ? "bg-rose-100 text-rose-600" : "bg-indigo-50 text-indigo-600";

                      return (
                        <div key={index} className={`p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${boxClass}`}>
                          <div className="flex gap-4">
                            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
                              {insight.icon}
                            </div>
                            <div className="space-y-1">
                              <h4 className="font-bold text-base">{insight.title}</h4>
                              <p className={`text-sm leading-relaxed ${isDestructive ? 'text-rose-700 dark:text-rose-300' : 'text-slate-500 dark:text-slate-400'}`}>
                                {insight.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmotionDashboard;
