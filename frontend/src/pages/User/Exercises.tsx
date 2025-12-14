import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Play, Clock, Heart, Brain, Smile, Wind, Search, BookOpen, Activity } from 'lucide-react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';

interface ExerciseProgress {
  status: string;
  progress_percentage: number;
  times_completed: number;
  total_time_spent_minutes: number;
  last_practiced_at?: string;
}

interface Exercise {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  difficulty: string;
  category: string;
  instructions: string;
  benefits?: string;
  progress?: ExerciseProgress;
}

interface ExerciseStats {
  total_exercises: number;
  completed_exercises: number;
  in_progress_exercises: number;
  completion_rate: number;
  total_completions: number;
  total_time_minutes: number;
  total_time_hours: number;
  streak_days: number;
  average_progress: number;
}

const Exercises = () => {
  const navigate = useNavigate();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [stats, setStats] = useState<ExerciseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadExercises();
    loadStats();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<{ exercises: Exercise[] }>(
        API_ENDPOINTS.EXERCISE.USER_PROGRESS
      );
      setExercises(response.exercises || []);
    } catch (error: any) {
      console.error('Failed to load exercises:', error);
      toast.error('Không thể tải danh sách bài tập');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await apiClient.get<{ stats: ExerciseStats }>(
        API_ENDPOINTS.EXERCISE.STATS
      );
      setStats(response.stats);
    } catch (error: any) {
      console.error('Failed to load stats:', error);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'breathing':
        return <Wind className="w-6 h-6" />;
      case 'meditation':
        return <Brain className="w-6 h-6" />;
      case 'journaling':
        return <BookOpen className="w-6 h-6" />;
      case 'cbt':
        return <Activity className="w-6 h-6" />;
      case 'relaxation':
        return <Heart className="w-6 h-6" />;
      default:
        return <Smile className="w-6 h-6" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      breathing: 'Thở',
      meditation: 'Thiền',
      journaling: 'Viết',
      cbt: 'CBT',
      relaxation: 'Thư giãn',
    };
    return labels[category] || category;
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      beginner: 'Dễ',
      intermediate: 'Trung bình',
      advanced: 'Khó',
    };
    return labels[difficulty] || difficulty;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-500';
      case 'intermediate':
        return 'bg-yellow-500';
      case 'advanced':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch =
      exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(exercises.map((e) => e.category)));

  const handleStartExercise = (exerciseId: number) => {
    navigate(`/user/exercise/${exerciseId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải bài tập...</p>
        </div>
      </div>
    );
  }

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
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hoàn Thành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completed_exercises}/{stats.total_exercises}
              </div>
              <Progress
                value={stats.completion_rate}
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Thời Gian
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_time_hours}h</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total_completions} lần hoàn thành
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.streak_days} ngày</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.streak_days > 0 ? 'Tiếp tục phát huy!' : 'Bắt đầu ngay hôm nay!'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm bài tập..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {getCategoryLabel(category)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground">
        Tìm thấy {filteredExercises.length} bài tập
      </div>

      {/* Exercise Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExercises.map((exercise) => {
          const progress = exercise.progress;
          const isCompleted = progress?.status === 'completed';
          const progressPercentage = progress?.progress_percentage || 0;

          return (
            <Card key={exercise.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getCategoryIcon(exercise.category)}
                  </div>
                  <Badge variant="secondary">{getCategoryLabel(exercise.category)}</Badge>
                </div>
                <CardTitle className="text-lg">{exercise.title}</CardTitle>
                <CardDescription>{exercise.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex-1 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{exercise.duration_minutes} phút</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${getDifficultyColor(
                        exercise.difficulty
                      )}`}
                    />
                    <span className="text-muted-foreground text-sm">
                      {getDifficultyLabel(exercise.difficulty)}
                    </span>
                  </div>
                </div>

                {progress && progressPercentage > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Tiến độ</span>
                      <span>{progressPercentage}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-1.5" />
                  </div>
                )}

                {progress && progress.times_completed > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Đã hoàn thành {progress.times_completed} lần
                  </div>
                )}

                <Button
                  className="w-full gap-2"
                  variant={isCompleted ? 'outline' : 'default'}
                  onClick={() => handleStartExercise(exercise.id)}
                >
                  <Play className="w-4 h-4" />
                  {isCompleted
                    ? 'Luyện lại'
                    : progressPercentage > 0
                      ? 'Tiếp tục'
                      : 'Bắt đầu'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredExercises.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              Không tìm thấy bài tập phù hợp với tiêu chí tìm kiếm
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Exercises;
