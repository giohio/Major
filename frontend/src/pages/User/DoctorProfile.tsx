import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Award, Briefcase, Clock, DollarSign, Languages, Calendar, MessageSquare, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { apiClient, API_ENDPOINTS } from '@/services/api';
import { toast } from 'sonner';

interface Review {
  id: number;
  user_id: number | null;
  rating: number;
  review_text: string;
  professionalism: number | null;
  communication: number | null;
  effectiveness: number | null;
  is_verified: boolean;
  is_anonymous: boolean;
  created_at: string;
}

interface ReviewStats {
  average_rating: number;
  review_count: number;
  avg_professionalism: number | null;
  avg_communication: number | null;
  avg_effectiveness: number | null;
  rating_distribution: { [key: number]: number };
}

interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: number;
  rating: number;
  reviews: number;
  price: number;
  available: boolean;
  languages: string[];
  avatar_url?: string;
  verified: boolean;
  bio?: string;
  rating_breakdown?: {
    professionalism: number | null;
    communication: number | null;
    effectiveness: number | null;
  };
  rating_distribution?: { [key: number]: number };
}

const DoctorProfile: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Review form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [professionalism, setProfessionalism] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [effectiveness, setEffectiveness] = useState(5);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctorProfile = useCallback(async () => {
    try {
      const response = await apiClient.get<Doctor>(API_ENDPOINTS.DOCTOR.GET(Number(doctorId)));
      setDoctor(response);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch doctor profile:', error);
      toast.error('Không thể tải thông tin bác sĩ');
      setLoading(false);
    }
  }, [doctorId]);

  const fetchReviews = useCallback(async () => {
    try {
      const response = await apiClient.get<{ reviews: Review[] }>(`/api/reviews/doctor/${doctorId}?limit=10`);
      setReviews(response.reviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  }, [doctorId]);

  const fetchReviewStats = useCallback(async () => {
    try {
      const response = await apiClient.get<ReviewStats>(`/api/reviews/doctor/${doctorId}/stats`);
      setReviewStats(response);
    } catch (error) {
      console.error('Failed to fetch review stats:', error);
    }
  }, [doctorId]);

  useEffect(() => {
    if (doctorId) {
      fetchDoctorProfile();
      fetchReviews();
      fetchReviewStats();
    }
  }, [doctorId, fetchDoctorProfile, fetchReviews, fetchReviewStats]);

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmitting(true);
    try {
      await apiClient.post(`/api/reviews/doctor/${doctorId}`, {
        rating: reviewRating,
        review_text: reviewText,
        professionalism,
        communication,
        effectiveness,
        is_anonymous: isAnonymous
      });

      toast.success('Your review has been submitted successfully');
      setShowReviewForm(false);
      setReviewText('');
      fetchReviews();
      fetchReviewStats();
      fetchDoctorProfile();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Không thể gửi đánh giá';
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
          />
        ))}
      </div>
    );
  };

  const renderRatingStars = (rating: number, onChange: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`h-6 w-6 cursor-pointer transition-colors ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
                }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading || !doctor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading doctor information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative">
              <img
                src={doctor.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doctor.name}`}
                alt={doctor.name}
                className="w-32 h-32 rounded-full object-cover"
              />
              {doctor.verified && (
                <div className="absolute -bottom-2 -right-2 bg-blue-500 rounded-full p-2">
                  <Award className="h-4 w-4 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{doctor.name}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Briefcase className="h-4 w-4" />
                    <span>{doctor.specialty}</span>
                  </div>
                </div>
                <Button onClick={() => navigate(`/user/book-appointment/${doctor.id}`)}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Đặt lịch hẹn
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center">
                    {renderStars(doctor.rating, 'lg')}
                    <span className="ml-2 text-2xl font-bold">{doctor.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">({doctor.reviews} đánh giá)</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-5 w-5" />
                  <span>{doctor.experience} năm kinh nghiệm</span>
                </div>

                <div className="flex items-center gap-2 font-semibold">
                  <DollarSign className="h-5 w-5" />
                  <span>{doctor.price.toLocaleString()}đ / buổi</span>
                </div>
              </div>

              {doctor.languages && doctor.languages.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <Languages className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {doctor.languages.map((lang) => (
                      <Badge key={lang} variant="secondary">
                        {lang}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        {doctor.bio && (
          <CardContent>
            <h3 className="font-semibold mb-2">Giới thiệu</h3>
            <p className="text-muted-foreground">{doctor.bio}</p>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="reviews" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reviews">Đánh giá</TabsTrigger>
          <TabsTrigger value="stats">Thống kê</TabsTrigger>
        </TabsList>

        <TabsContent value="reviews" className="space-y-6">
          {/* Write Review Button */}
          {!showReviewForm && (
            <Card>
              <CardContent className="pt-6">
                <Button onClick={() => setShowReviewForm(true)} className="w-full">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Viết đánh giá
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Review Form */}
          {showReviewForm && (
            <Card>
              <CardHeader>
                <CardTitle>Viết đánh giá của bạn</CardTitle>
                <CardDescription>Chia sẻ trải nghiệm của bạn với bác sĩ {doctor.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Đánh giá chung</label>
                  {renderRatingStars(reviewRating, setReviewRating)}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Chuyên môn</label>
                  {renderRatingStars(professionalism, setProfessionalism)}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Giao tiếp</label>
                  {renderRatingStars(communication, setCommunication)}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Hiệu quả</label>
                  {renderRatingStars(effectiveness, setEffectiveness)}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Nội dung đánh giá</label>
                  <Textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm của bạn..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm">Đánh giá ẩn danh</label>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSubmitReview} disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Hủy
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {renderStars(review.rating)}
                        {review.is_verified && (
                          <Badge variant="secondary" className="text-xs">
                            <Award className="h-3 w-3 mr-1" />
                            Đã xác minh
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{review.review_text}</p>

                  {(review.professionalism || review.communication || review.effectiveness) && (
                    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                      {review.professionalism && (
                        <div>
                          <p className="text-muted-foreground mb-1">Chuyên môn</p>
                          {renderStars(review.professionalism, 'sm')}
                        </div>
                      )}
                      {review.communication && (
                        <div>
                          <p className="text-muted-foreground mb-1">Giao tiếp</p>
                          {renderStars(review.communication, 'sm')}
                        </div>
                      )}
                      {review.effectiveness && (
                        <div>
                          <p className="text-muted-foreground mb-1">Hiệu quả</p>
                          {renderStars(review.effectiveness, 'sm')}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {reviews.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Chưa có đánh giá nào</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {reviewStats && (
            <>
              {/* Rating Breakdown */}
              {doctor.rating_breakdown && (
                <Card>
                  <CardHeader>
                    <CardTitle>Đánh giá chi tiết</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {doctor.rating_breakdown.professionalism && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Chuyên môn</span>
                          <span className="text-sm">{doctor.rating_breakdown.professionalism.toFixed(1)}/5</span>
                        </div>
                        <Progress value={(doctor.rating_breakdown.professionalism / 5) * 100} />
                      </div>
                    )}
                    {doctor.rating_breakdown.communication && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Giao tiếp</span>
                          <span className="text-sm">{doctor.rating_breakdown.communication.toFixed(1)}/5</span>
                        </div>
                        <Progress value={(doctor.rating_breakdown.communication / 5) * 100} />
                      </div>
                    )}
                    {doctor.rating_breakdown.effectiveness && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Hiệu quả</span>
                          <span className="text-sm">{doctor.rating_breakdown.effectiveness.toFixed(1)}/5</span>
                        </div>
                        <Progress value={(doctor.rating_breakdown.effectiveness / 5) * 100} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Rating Distribution */}
              {reviewStats.rating_distribution && (
                <Card>
                  <CardHeader>
                    <CardTitle>Phân bố đánh giá</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = reviewStats.rating_distribution[rating] || 0;
                      const percentage = reviewStats.review_count > 0
                        ? (count / reviewStats.review_count) * 100
                        : 0;

                      return (
                        <div key={rating} className="flex items-center gap-3">
                          <span className="text-sm w-8">{rating}★</span>
                          <Progress value={percentage} className="flex-1" />
                          <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}

              {/* Summary Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tổng quan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-2xl font-bold">{reviewStats.average_rating.toFixed(1)}/5</p>
                      <p className="text-sm text-muted-foreground">Đánh giá trung bình</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{reviewStats.review_count}</p>
                      <p className="text-sm text-muted-foreground">Tổng đánh giá</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DoctorProfile;
