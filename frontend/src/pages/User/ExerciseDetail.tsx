import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import {
    ArrowLeft,
    Play,
    Pause,
    CheckCircle,
    Clock,
    Heart,
    Brain,
    Wind,
    BookOpen,
    Activity,
    Lightbulb,
} from 'lucide-react';
import { apiClient } from '../../services/api.client';
import { API_ENDPOINTS } from '../../config/api.config';
import { toast } from 'sonner';

interface Exercise {
    id: number;
    title: string;
    description: string;
    duration_minutes: number;
    difficulty: string;
    category: string;
    instructions: string;
    benefits?: string;
}

const ExerciseDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [exercise, setExercise] = useState<Exercise | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRunning, setIsRunning] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [notes, setNotes] = useState('');
    const [showCompletion, setShowCompletion] = useState(false);

    useEffect(() => {
        if (id) {
            loadExercise(parseInt(id));
        }
    }, [id]);

    useEffect(() => {
        let interval: number;

        if (isRunning && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        handleTimerComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isRunning, timeLeft]);

    const loadExercise = async (exerciseId: number) => {
        try {
            setLoading(true);
            const response = await apiClient.get<{ exercise: Exercise }>(
                API_ENDPOINTS.EXERCISE.GET(exerciseId)
            );
            setExercise(response.exercise);
            setTimeLeft(response.exercise.duration_minutes * 60);
        } catch (error: any) {
            console.error('Failed to load exercise:', error);
            toast.error('Không thể tải bài tập');
            navigate('/user/exercises');
        } finally {
            setLoading(false);
        }
    };

    const handleStart = async () => {
        if (!exercise) return;

        try {
            await apiClient.post(API_ENDPOINTS.EXERCISE.START(exercise.id), {});
            setIsRunning(true);
            toast.success('Bắt đầu bài tập!');
        } catch (error: any) {
            console.error('Failed to start exercise:', error);
            toast.error('Không thể bắt đầu bài tập');
        }
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleResume = () => {
        setIsRunning(true);
    };

    const handleTimerComplete = () => {
        toast.success('Hoàn thành bài tập!', {
            description: 'Bạn có muốn ghi chú lại cảm nhận của mình không?',
        });
        setShowCompletion(true);
    };

    const handleComplete = async () => {
        if (!exercise) return;

        try {
            const timeSpent = Math.ceil((exercise.duration_minutes * 60 - timeLeft) / 60);

            await apiClient.post(API_ENDPOINTS.EXERCISE.COMPLETE(exercise.id), {
                time_spent_minutes: timeSpent,
                notes: notes.trim() || undefined,
            });

            toast.success('Đã lưu tiến độ!');
            navigate('/user/exercises');
        } catch (error: any) {
            console.error('Failed to complete exercise:', error);
            toast.error('Không thể lưu tiến độ');
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'breathing':
                return <Wind className="w-8 h-8" />;
            case 'meditation':
                return <Brain className="w-8 h-8" />;
            case 'journaling':
                return <BookOpen className="w-8 h-8" />;
            case 'cbt':
                return <Activity className="w-8 h-8" />;
            case 'relaxation':
                return <Heart className="w-8 h-8" />;
            default:
                return <Activity className="w-8 h-8" />;
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

    if (!exercise) {
        return null;
    }

    const progressPercentage = ((exercise.duration_minutes * 60 - timeLeft) / (exercise.duration_minutes * 60)) * 100;

    return (
        <div className="p-6 space-y-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/user/exercises')}>
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-foreground">{exercise.title}</h1>
                    <p className="text-muted-foreground mt-1">{exercise.description}</p>
                </div>
            </div>

            {/* Exercise Info */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-lg bg-primary/10 text-primary">
                            {getCategoryIcon(exercise.category)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">{getCategoryLabel(exercise.category)}</Badge>
                                <Badge variant="outline">{getDifficultyLabel(exercise.difficulty)}</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{exercise.duration_minutes} phút</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Timer */}
            <Card>
                <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                        <div className="text-6xl font-bold text-primary">{formatTime(timeLeft)}</div>
                        <Progress value={progressPercentage} className="h-2" />

                        <div className="flex gap-3 justify-center">
                            {!isRunning && timeLeft === exercise.duration_minutes * 60 && (
                                <Button size="lg" onClick={handleStart} className="gap-2">
                                    <Play className="w-5 h-5" />
                                    Bắt đầu
                                </Button>
                            )}

                            {!isRunning && timeLeft > 0 && timeLeft < exercise.duration_minutes * 60 && (
                                <>
                                    <Button size="lg" onClick={handleResume} className="gap-2">
                                        <Play className="w-5 h-5" />
                                        Tiếp tục
                                    </Button>
                                    <Button size="lg" variant="outline" onClick={() => setShowCompletion(true)}>
                                        <CheckCircle className="w-5 h-5 mr-2" />
                                        Hoàn thành
                                    </Button>
                                </>
                            )}

                            {isRunning && (
                                <Button size="lg" variant="outline" onClick={handlePause} className="gap-2">
                                    <Pause className="w-5 h-5" />
                                    Tạm dừng
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Instructions */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                        <BookOpen className="w-5 h-5" />
                        Hướng Dẫn
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-foreground">
                            {exercise.instructions}
                        </pre>
                    </div>
                </CardContent>
            </Card>

            {/* Benefits */}
            {exercise.benefits && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2 text-lg font-semibold">
                            <Lightbulb className="w-5 h-5" />
                            Lợi Ích
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{exercise.benefits}</p>
                    </CardContent>
                </Card>
            )}

            {/* Completion Notes */}
            {showCompletion && (
                <Card className="border-primary">
                    <CardHeader>
                        <h3 className="text-lg font-semibold">Hoàn Thành Bài Tập</h3>
                        <p className="text-sm text-muted-foreground">
                            Ghi lại cảm nhận và suy nghĩ của bạn sau khi hoàn thành bài tập
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Textarea
                            placeholder="Bạn cảm thấy thế nào sau bài tập này? (Không bắt buộc)"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            rows={4}
                        />
                        <div className="flex gap-3">
                            <Button onClick={handleComplete} className="flex-1">
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Lưu và Hoàn Thành
                            </Button>
                            <Button variant="outline" onClick={() => setShowCompletion(false)}>
                                Hủy
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default ExerciseDetail;
