import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Play, Clock, Heart, Brain, Smile, Wind } from 'lucide-react';

interface Exercise {
  id: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
  category: string;
  icon: React.ReactNode;
  completed?: boolean;
  progress?: number;
}

const Exercises = () => {
  const exercises: Exercise[] = [
    {
      id: 1,
      title: 'Thở Sâu 4-7-8',
      description: 'Kỹ thuật thở giúp giảm căng thẳng và lo lắng nhanh chóng',
      duration: '5 phút',
      difficulty: 'Dễ',
      category: 'Thở',
      icon: <Wind className="w-6 h-6" />,
      completed: true,
      progress: 100
    },
    {
      id: 2,
      title: 'Thiền Chánh Niệm',
      description: 'Tập trung vào hiện tại, quan sát suy nghĩ không phán xét',
      duration: '10 phút',
      difficulty: 'Trung bình',
      category: 'Thiền',
      icon: <Brain className="w-6 h-6" />,
      completed: false,
      progress: 60
    },
    {
      id: 3,
      title: 'Yoga Buổi Sáng',
      description: 'Các động tác yoga nhẹ nhàng để khởi động ngày mới',
      duration: '15 phút',
      difficulty: 'Dễ',
      category: 'Vận động',
      icon: <Heart className="w-6 h-6" />,
      completed: false,
      progress: 0
    },
    {
      id: 4,
      title: 'Ghi Nhật Ký Biết Ơn',
      description: 'Viết ra 3 điều bạn biết ơn trong ngày',
      duration: '5 phút',
      difficulty: 'Dễ',
      category: 'Viết',
      icon: <Smile className="w-6 h-6" />,
      completed: true,
      progress: 100
    },
    {
      id: 5,
      title: 'Thư Giãn Cơ Tiến Triển',
      description: 'Căng và thả lỏng từng nhóm cơ để giảm căng thẳng',
      duration: '20 phút',
      difficulty: 'Trung bình',
      category: 'Thư giãn',
      icon: <Heart className="w-6 h-6" />,
      completed: false,
      progress: 30
    },
    {
      id: 6,
      title: 'Tưởng Tượng Hướng Dẫn',
      description: 'Hình dung một nơi yên bình để thư giãn tâm trí',
      duration: '8 phút',
      difficulty: 'Dễ',
      category: 'Tưởng tượng',
      icon: <Brain className="w-6 h-6" />,
      completed: false,
      progress: 0
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Dễ':
        return 'bg-green-500';
      case 'Trung bình':
        return 'bg-yellow-500';
      case 'Khó':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const completedCount = exercises.filter(e => e.completed).length;
  const totalProgress = Math.round(
    exercises.reduce((sum, e) => sum + (e.progress || 0), 0) / exercises.length
  );

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bài Tập Tâm Lý</h1>
        <p className="text-muted-foreground mt-1">
          Thực hành các kỹ thuật giúp cải thiện sức khỏe tinh thần
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hoàn Thành
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {completedCount}/{exercises.length}
            </div>
            <Progress value={(completedCount / exercises.length) * 100} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tiến Độ Tổng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProgress}%</div>
            <Progress value={totalProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7 ngày</div>
            <p className="text-xs text-muted-foreground mt-1">Tiếp tục phát huy!</p>
          </CardContent>
        </Card>
      </div>

      {/* Exercise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  {exercise.icon}
                </div>
                <Badge variant="secondary">{exercise.category}</Badge>
              </div>
              <CardTitle className="text-lg">{exercise.title}</CardTitle>
              <CardDescription>{exercise.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{exercise.duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getDifficultyColor(exercise.difficulty)}`} />
                  <span className="text-muted-foreground text-sm">{exercise.difficulty}</span>
                </div>
              </div>

              {exercise.progress !== undefined && exercise.progress > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Tiến độ</span>
                    <span>{exercise.progress}%</span>
                  </div>
                  <Progress value={exercise.progress} className="h-1.5" />
                </div>
              )}

              <Button className="w-full gap-2" variant={exercise.completed ? 'outline' : 'default'}>
                <Play className="w-4 h-4" />
                {exercise.completed ? 'Luyện lại' : exercise.progress ? 'Tiếp tục' : 'Bắt đầu'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Exercises;
