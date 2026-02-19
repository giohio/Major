import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Brain, Activity, TrendingUp, Zap, Database, Clock } from 'lucide-react';

interface AIModel {
  id: number;
  name: string;
  version: string;
  type: 'emotion' | 'chat' | 'recommendation';
  status: 'active' | 'training' | 'idle';
  accuracy: number;
  latency: number;
  requests: number;
  lastUpdated: string;
}

const AIModelManagement = () => {
  const models: AIModel[] = [
    {
      id: 1,
      name: 'Emotion Detection Model',
      version: 'v2.5.1',
      type: 'emotion',
      status: 'active',
      accuracy: 94.2,
      latency: 120,
      requests: 15234,
      lastUpdated: '2024-01-20'
    },
    {
      id: 2,
      name: 'Mental Health Chatbot',
      version: 'v3.1.0',
      type: 'chat',
      status: 'active',
      accuracy: 92.8,
      latency: 250,
      requests: 28945,
      lastUpdated: '2024-01-19'
    },
    {
      id: 3,
      name: 'Exercise Recommendation',
      version: 'v1.8.2',
      type: 'recommendation',
      status: 'active',
      accuracy: 88.5,
      latency: 180,
      requests: 8732,
      lastUpdated: '2024-01-18'
    },
    {
      id: 4,
      name: 'Sentiment Analysis',
      version: 'v2.0.0-beta',
      type: 'emotion',
      status: 'training',
      accuracy: 0,
      latency: 0,
      requests: 0,
      lastUpdated: '2024-01-22'
    }
  ];

  const systemMetrics = [
    {
      label: 'Tổng Requests Hôm Nay',
      value: '12,345',
      change: '+15%',
      icon: Activity,
      color: 'text-blue-600'
    },
    {
      label: 'Độ Chính Xác TB',
      value: '91.8%',
      change: '+2.3%',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      label: 'Latency Trung Bình',
      value: '183ms',
      change: '-12ms',
      icon: Zap,
      color: 'text-purple-600'
    },
    {
      label: 'Model Uptime',
      value: '99.8%',
      change: 'Ổn định',
      icon: Database,
      color: 'text-orange-600'
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">Active</Badge>;
      case 'training':
        return <Badge className="bg-yellow-600">Training</Badge>;
      case 'idle':
        return <Badge variant="secondary">Không hoạt động</Badge>;
      default:
        return null;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'emotion':
        return <Badge variant="outline" className="gap-1"><Brain className="w-3 h-3" />Cảm xúc</Badge>;
      case 'chat':
        return <Badge variant="outline" className="gap-1"><Activity className="w-3 h-3" />Chat</Badge>;
      case 'recommendation':
        return <Badge variant="outline" className="gap-1"><TrendingUp className="w-3 h-3" />Gợi ý</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản Lý AI Model</h1>
          <p className="text-muted-foreground mt-1">
            Cấu hình và giám sát các mô hình AI
          </p>
        </div>
        <Button>
          <Brain className="w-4 h-4 mr-2" />
          Train Model Mới
        </Button>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {systemMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <metric.icon className={`w-4 h-4 ${metric.color}`} />
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-green-600 mt-1">{metric.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Models List */}
      <div className="space-y-4">
        {models.map((model) => (
          <Card key={model.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Brain className="w-6 h-6 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{model.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{model.version}</Badge>
                        {getTypeBadge(model.type)}
                      </CardDescription>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(model.status)}
                  <Button variant="outline" size="sm">
                    Cấu hình
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Accuracy */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Độ chính xác</span>
                    <span className="font-medium">{model.accuracy > 0 ? `${model.accuracy}%` : 'N/A'}</span>
                  </div>
                  {model.accuracy > 0 && <Progress value={model.accuracy} className="h-2" />}
                </div>

                {/* Latency */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Latency
                    </span>
                    <span className="font-medium">{model.latency > 0 ? `${model.latency}ms` : 'N/A'}</span>
                  </div>
                  {model.latency > 0 && (
                    <div className="text-xs text-muted-foreground">
                      {model.latency < 200 ? '✓ Good' : model.latency < 300 ? '⚠ Acceptable' : '✗ Needs Optimization'}
                    </div>
                  )}
                </div>

                {/* Requests */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      Requests
                    </span>
                    <span className="font-medium">
                      {model.requests > 0 ? model.requests.toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  {model.requests > 0 && (
                    <div className="text-xs text-muted-foreground">Hôm nay</div>
                  )}
                </div>

                {/* Last Updated */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Cập nhật</span>
                    <span className="font-medium">
                      {new Date(model.lastUpdated).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {model.status === 'training' ? 'Training...' : 'Operating normally'}
                  </div>
                </div>
              </div>

              {model.status === 'training' && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Training Progress</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2 mb-1" />
                  <p className="text-xs text-muted-foreground">Ước tính: 2 giờ còn lại</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Training History */}
      <Card>
        <CardHeader>
          <CardTitle>Lịch Sử Training</CardTitle>
          <CardDescription>Các phiên training gần đây</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { model: 'Emotion Detection Model', version: 'v2.5.1', date: '2024-01-20', duration: '3.5h', accuracy: '94.2%', status: 'success' },
              { model: 'Mental Health Chatbot', version: 'v3.1.0', date: '2024-01-19', duration: '5.2h', accuracy: '92.8%', status: 'success' },
              { model: 'Exercise Recommendation', version: 'v1.8.2', date: '2024-01-18', duration: '2.1h', accuracy: '88.5%', status: 'success' }
            ].map((history, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{history.model}</div>
                    <div className="text-sm text-muted-foreground">
                      {history.version} • {new Date(history.date).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-sm font-medium">Accuracy: {history.accuracy}</div>
                    <div className="text-xs text-muted-foreground">Duration: {history.duration}</div>
                  </div>
                  <Badge className="bg-green-600">Thành công</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIModelManagement;
