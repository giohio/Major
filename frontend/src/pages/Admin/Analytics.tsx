import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { TrendingUp, Users, DollarSign, Activity, BarChart3, Calendar } from 'lucide-react';

const Analytics = () => {
  const overviewStats = [
    {
      label: 'Tổng Doanh Thu',
      value: '$147,213',
      change: '+18.2%',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Người Dùng Mới',
      value: '1,234',
      change: '+12.5%',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Phiên Tư Vấn',
      value: '3,892',
      change: '+8.3%',
      icon: Activity,
      color: 'text-purple-600'
    },
    {
      label: 'Tỷ Lệ Giữ Chân',
      value: '87.4%',
      change: '+3.1%',
      icon: TrendingUp,
      color: 'text-orange-600'
    }
  ];

  const userGrowthData = [
    { month: 'T1', users: 850, newUsers: 120 },
    { month: 'T2', users: 920, newUsers: 145 },
    { month: 'T3', users: 1050, newUsers: 180 },
    { month: 'T4', users: 1180, newUsers: 195 },
    { month: 'T5', users: 1320, newUsers: 210 },
    { month: 'T6', users: 1480, newUsers: 235 }
  ];

  const revenueData = [
    { month: 'T1', revenue: 98500 },
    { month: 'T2', revenue: 105200 },
    { month: 'T3', revenue: 118900 },
    { month: 'T4', revenue: 126400 },
    { month: 'T5', revenue: 139800 },
    { month: 'T6', revenue: 147200 }
  ];

  const maxRevenue = Math.max(...revenueData.map(d => d.revenue));
  const maxUsers = Math.max(...userGrowthData.map(d => d.users));

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const topDoctors = [
    { name: 'Dr. Nguyễn Văn An', sessions: 145, rating: 4.9, revenue: 72500000 },
    { name: 'Dr. Trần Thị Bình', sessions: 132, rating: 4.8, revenue: 66000000 },
    { name: 'Dr. Lê Văn Cường', sessions: 98, rating: 4.7, revenue: 49000000 }
  ];

  const popularExercises = [
    { name: 'Thiền Chánh Niệm', completions: 892, avgRating: 4.8 },
    { name: 'Hơi Thở Sâu', completions: 756, avgRating: 4.7 },
    { name: 'Thư Giãn Cơ', completions: 634, avgRating: 4.6 }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Báo Cáo</h1>
          <p className="text-muted-foreground mt-1">
            Phân tích dữ liệu và xu hướng
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="w-4 h-4" />
            Tháng này
          </Button>
          <Button className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {overviewStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stat.change} so tháng trước
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Doanh Thu</TabsTrigger>
          <TabsTrigger value="users">Người Dùng</TabsTrigger>
          <TabsTrigger value="performance">Hiệu Suất</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doanh Thu 6 Tháng Gần Đây</CardTitle>
              <CardDescription>Xu hướng doanh thu theo tháng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{data.month}</span>
                      <span className="font-medium">{formatPrice(data.revenue)}</span>
                    </div>
                    <div className="w-full h-8 bg-green-100 dark:bg-green-950 rounded overflow-hidden">
                      <div
                        className="h-full bg-green-600 transition-all"
                        style={{ width: `${(data.revenue / maxRevenue) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tăng Trưởng Người Dùng</CardTitle>
              <CardDescription>Số lượng người dùng và người dùng mới</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userGrowthData.map((data, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{data.month}</span>
                      <div className="flex gap-4">
                        <span className="text-blue-600">Tổng: {data.users}</span>
                        <span className="text-green-600">Mới: +{data.newUsers}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 h-8 bg-blue-100 dark:bg-blue-950 rounded overflow-hidden">
                        <div
                          className="h-full bg-blue-600 transition-all"
                          style={{ width: `${(data.users / maxUsers) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Doctors */}
            <Card>
              <CardHeader>
                <CardTitle>Bác Sĩ Xuất Sắc</CardTitle>
                <CardDescription>Top bác sĩ theo số buổi tư vấn</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topDoctors.map((doctor, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {doctor.sessions} buổi • {doctor.rating} ★
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatPrice(doctor.revenue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Popular Exercises */}
            <Card>
              <CardHeader>
                <CardTitle>Bài Tập Phổ Biến</CardTitle>
                <CardDescription>Bài tập được hoàn thành nhiều nhất</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {popularExercises.map((exercise, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{exercise.name}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{exercise.completions} lần</Badge>
                          <span className="text-sm text-yellow-600">{exercise.avgRating} ★</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-purple-100 dark:bg-purple-950 rounded overflow-hidden">
                        <div
                          className="h-full bg-purple-600"
                          style={{ width: `${(exercise.completions / 892) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
