import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Search, BookOpen, Video, FileText, Heart, Brain, Wind, Smile } from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  category: 'mindfulness' | 'cbt' | 'relaxation' | 'emotion';
  type: 'exercise' | 'article' | 'video';
  duration?: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  usageCount: number;
}

const TherapyLibrary = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const resources: Resource[] = [
    {
      id: 1,
      title: 'Thiền Chánh Niệm Cơ Bản',
      category: 'mindfulness',
      type: 'exercise',
      duration: '10 phút',
      description: 'Bài tập thiền cơ bản giúp tập trung vào hiện tại và giảm lo âu.',
      difficulty: 'beginner',
      usageCount: 24
    },
    {
      id: 2,
      title: 'Kỹ Thuật Hơi Thở 4-7-8',
      category: 'relaxation',
      type: 'exercise',
      duration: '5 phút',
      description: 'Kỹ thuật hơi thở giúp giảm căng thẳng và dễ ngủ hơn.',
      difficulty: 'beginner',
      usageCount: 32
    },
    {
      id: 3,
      title: 'Tái Cấu Trúc Tư Duy (CBT)',
      category: 'cbt',
      type: 'article',
      description: 'Hướng dẫn về kỹ thuật tái cấu trúc tư duy tiêu cực.',
      difficulty: 'intermediate',
      usageCount: 18
    },
    {
      id: 4,
      title: 'Thiền Quét Cơ Thể',
      category: 'mindfulness',
      type: 'video',
      duration: '20 phút',
      description: 'Video hướng dẫn thiền quét cơ thể để thư giãn sâu.',
      difficulty: 'intermediate',
      usageCount: 15
    },
    {
      id: 5,
      title: 'Nhật Ký Cảm Xúc',
      category: 'emotion',
      type: 'exercise',
      duration: '15 phút',
      description: 'Mẫu nhật ký giúp theo dõi và hiểu rõ cảm xúc của bạn.',
      difficulty: 'beginner',
      usageCount: 28
    },
    {
      id: 6,
      title: 'Thư Giãn Cơ Tiến Triển',
      category: 'relaxation',
      type: 'exercise',
      duration: '15 phút',
      description: 'Bài tập thư giãn từng nhóm cơ để giảm căng thẳng.',
      difficulty: 'beginner',
      usageCount: 21
    },
    {
      id: 7,
      title: 'Xử Lý Tư Duy Phiền Muộn',
      category: 'cbt',
      type: 'article',
      description: 'Chiến lược CBT để xử lý tư duy tiêu cực và phiền muộn.',
      difficulty: 'advanced',
      usageCount: 12
    },
    {
      id: 8,
      title: 'Thiền Từ Bi',
      category: 'mindfulness',
      type: 'video',
      duration: '25 phút',
      description: 'Thực hành thiền từ bi để phát triển lòng thương yêu.',
      difficulty: 'advanced',
      usageCount: 9
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mindfulness':
        return <Brain className="w-4 h-4" />;
      case 'cbt':
        return <BookOpen className="w-4 h-4" />;
      case 'relaxation':
        return <Wind className="w-4 h-4" />;
      case 'emotion':
        return <Heart className="w-4 h-4" />;
      default:
        return <Smile className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'exercise':
        return <Smile className="w-5 h-5 text-blue-600" />;
      case 'article':
        return <FileText className="w-5 h-5 text-green-600" />;
      case 'video':
        return <Video className="w-5 h-5 text-purple-600" />;
      default:
        return null;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return <Badge className="bg-green-600">Cơ bản</Badge>;
      case 'intermediate':
        return <Badge className="bg-yellow-600">Trung bình</Badge>;
      case 'advanced':
        return <Badge variant="destructive">Nâng cao</Badge>;
      default:
        return null;
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'mindfulness':
        return 'Chánh niệm';
      case 'cbt':
        return 'CBT';
      case 'relaxation':
        return 'Thư giãn';
      case 'emotion':
        return 'Cảm xúc';
      default:
        return category;
    }
  };

  const stats = [
    { label: 'Tổng Tài Nguyên', value: resources.length, icon: BookOpen },
    { label: 'Bài Tập', value: resources.filter(r => r.type === 'exercise').length, icon: Smile },
    { label: 'Video', value: resources.filter(r => r.type === 'video').length, icon: Video },
    { label: 'Bài Viết', value: resources.filter(r => r.type === 'article').length, icon: FileText }
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Thư Viện Liệu Pháp</h1>
        <p className="text-muted-foreground mt-1">
          Tài nguyên điều trị và bài tập cho bệnh nhân
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <stat.icon className="w-4 h-4" />
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Tài Nguyên Điều Trị</CardTitle>
              <CardDescription>Chọn tài nguyên phù hợp cho bệnh nhân</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm tài nguyên..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={setActiveCategory}>
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="all">Tất cả</TabsTrigger>
              <TabsTrigger value="mindfulness">Chánh niệm</TabsTrigger>
              <TabsTrigger value="cbt">CBT</TabsTrigger>
              <TabsTrigger value="relaxation">Thư giãn</TabsTrigger>
              <TabsTrigger value="emotion">Cảm xúc</TabsTrigger>
            </TabsList>

            <TabsContent value={activeCategory} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(resource.type)}
                            <Badge variant="outline" className="gap-1">
                              {getCategoryIcon(resource.category)}
                              {getCategoryName(resource.category)}
                            </Badge>
                          </div>
                          <CardTitle className="text-base">{resource.title}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {resource.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        {getDifficultyBadge(resource.difficulty)}
                        {resource.duration && (
                          <span className="text-xs text-muted-foreground">
                            {resource.duration}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          Đã dùng: {resource.usageCount} lần
                        </span>
                        <Button size="sm" variant="outline">
                          Gợi ý
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredResources.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>Không tìm thấy tài nguyên phù hợp</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TherapyLibrary;
