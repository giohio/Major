import { useState } from 'react';
import './Exercises.css';

type ExerciseCategory = 'all' | 'breathing' | 'meditation' | 'cbt' | 'mindfulness' | 'relaxation';
type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

interface Exercise {
  id: string;
  title: string;
  description: string;
  category: ExerciseCategory;
  duration: number; // minutes
  difficulty: DifficultyLevel;
  icon: string;
  steps?: string[];
  benefits?: string[];
}

const Exercises = () => {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data - replace with API
  const exercises: Exercise[] = [
    {
      id: '1',
      title: 'Hít thở 4-7-8',
      description: 'Kỹ thuật thở giúp giảm căng thẳng và cải thiện giấc ngủ',
      category: 'breathing',
      duration: 5,
      difficulty: 'beginner',
      icon: '🌬️',
      steps: [
        'Ngồi thoải mái, lưng thẳng',
        'Thở ra hoàn toàn qua miệng',
        'Hít vào qua mũi đếm đến 4',
        'Nín thở đếm đến 7',
        'Thở ra qua miệng đếm đến 8',
        'Lặp lại 4 chu kỳ'
      ],
      benefits: ['Giảm lo âu', 'Cải thiện giấc ngủ', 'Giảm huyết áp']
    },
    {
      id: '2',
      title: 'Thiền Chánh Niệm',
      description: 'Tập trung vào hiện tại, quan sát suy nghĩ không phán xét',
      category: 'meditation',
      duration: 15,
      difficulty: 'intermediate',
      icon: '🧘',
      steps: [
        'Tìm nơi yên tĩnh, ngồi thoải mái',
        'Nhắm mắt, tập trung vào hơi thở',
        'Quan sát suy nghĩ đến và đi',
        'Không phán xét, chấp nhận',
        'Nếu xao lãng, nhẹ nhàng quay về hơi thở'
      ],
      benefits: ['Tăng tập trung', 'Giảm stress', 'Cải thiện nhận thức']
    },
    {
      id: '3',
      title: 'Ghi Nhật Ký Suy Nghĩ',
      description: 'Kỹ thuật CBT để nhận diện và thay đổi suy nghĩ tiêu cực',
      category: 'cbt',
      duration: 10,
      difficulty: 'beginner',
      icon: '📝',
      steps: [
        'Viết ra tình huống gây lo lắng',
        'Ghi lại suy nghĩ tự động',
        'Xác định cảm xúc và mức độ (0-10)',
        'Tìm bằng chứng ủng hộ và phản bác',
        'Viết suy nghĩ cân bằng hơn'
      ],
      benefits: ['Nhận diện suy nghĩ tiêu cực', 'Tăng tự nhận thức', 'Giảm trầm cảm']
    },
    {
      id: '4',
      title: 'Quét Cơ Thể',
      description: 'Mindfulness quét từng phần cơ thể, giải phóng căng thẳng',
      category: 'mindfulness',
      duration: 20,
      difficulty: 'beginner',
      icon: '🔍',
      steps: [
        'Nằm ngửa, mắt nhắm',
        'Bắt đầu từ ngón chân, chú ý cảm giác',
        'Di chuyển lên bàn chân, cẳng chân',
        'Tiếp tục lên đùi, bụng, ngực',
        'Quét vai, cánh tay, bàn tay',
        'Kết thúc ở cổ, mặt, đầu'
      ],
      benefits: ['Giảm căng thẳng cơ bắp', 'Cải thiện giấc ngủ', 'Tăng nhận thức cơ thể']
    },
    {
      id: '5',
      title: 'Thư Giãn Cơ Tiến Triển',
      description: 'Căng và thả lỏng từng nhóm cơ để giảm căng thẳng',
      category: 'relaxation',
      duration: 12,
      difficulty: 'beginner',
      icon: '💆',
      steps: [
        'Ngồi hoặc nằm thoải mái',
        'Căng cơ bàn chân 5 giây, thả lỏng',
        'Lặp lại với cẳng chân',
        'Tiếp tục với đùi, bụng, ngực',
        'Căng vai, cánh tay, bàn tay',
        'Kết thúc với mặt và cổ'
      ],
      benefits: ['Giảm căng thẳng', 'Cải thiện tuần hoàn', 'Giảm đau đầu']
    },
    {
      id: '6',
      title: 'Thiền Từ Bi',
      description: 'Phát triển lòng từ bi với bản thân và người khác',
      category: 'meditation',
      duration: 15,
      difficulty: 'intermediate',
      icon: '💖',
      steps: [
        'Ngồi yên tĩnh, thở sâu',
        'Nghĩ về bản thân với lòng yêu thương',
        'Lặp lại: "Mong tôi được bình an và hạnh phúc"',
        'Mở rộng ra người thân',
        'Mở rộng ra tất cả chúng sinh'
      ],
      benefits: ['Tăng lòng từ bi', 'Giảm tự trách', 'Cải thiện mối quan hệ']
    },
    {
      id: '7',
      title: 'Kỹ Thuật Nền Tảng 5-4-3-2-1',
      description: 'Sử dụng 5 giác quan để kết nối với hiện tại',
      category: 'mindfulness',
      duration: 5,
      difficulty: 'beginner',
      icon: '👁️',
      steps: [
        'Quan sát 5 thứ bạn thấy',
        'Chạm vào 4 thứ bạn cảm nhận',
        'Lắng nghe 3 âm thanh',
        'Ngửi 2 mùi hương',
        'Nếm 1 hương vị'
      ],
      benefits: ['Giảm lo âu cấp tính', 'Kết nối hiện tại', 'Ngăn cơn hoảng loạn']
    },
    {
      id: '8',
      title: 'Thách Thức Suy Nghĩ',
      description: 'CBT để đặt câu hỏi và thay đổi niềm tin tiêu cực',
      category: 'cbt',
      duration: 15,
      difficulty: 'advanced',
      icon: '🤔',
      steps: [
        'Xác định suy nghĩ tiêu cực cụ thể',
        'Hỏi: "Bằng chứng gì ủng hộ?"',
        'Hỏi: "Có góc nhìn khác không?"',
        'Hỏi: "Tôi sẽ nói gì với bạn?"',
        'Viết lại suy nghĩ cân bằng hơn'
      ],
      benefits: ['Thay đổi tư duy', 'Giảm lo âu', 'Tăng tự tin']
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '📚' },
    { id: 'breathing', name: 'Hít thở', icon: '🌬️' },
    { id: 'meditation', name: 'Thiền', icon: '🧘' },
    { id: 'cbt', name: 'CBT', icon: '📝' },
    { id: 'mindfulness', name: 'Chánh niệm', icon: '🔍' },
    { id: 'relaxation', name: 'Thư giãn', icon: '💆' }
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    const matchesSearch = exercise.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         exercise.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyLabel = (difficulty: DifficultyLevel) => {
    const labels = {
      beginner: 'Cơ bản',
      intermediate: 'Trung bình',
      advanced: 'Nâng cao'
    };
    return labels[difficulty];
  };

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
    const colors = {
      beginner: 'var(--success)',
      intermediate: 'var(--warning)',
      advanced: 'var(--danger)'
    };
    return colors[difficulty];
  };

  return (
    <div className="exercises-page">
      {/* Header */}
      <div className="exercises-header">
        <div>
          <h1 className="exercises-title">Bài Tập Tự Chăm Sóc</h1>
          <p className="exercises-subtitle">
            Thư viện bài tập CBT, mindfulness và kỹ thuật thư giãn
          </p>
        </div>
        <div className="exercises-stats">
          <div className="stat-badge">
            <span className="stat-icon">✅</span>
            <span className="stat-text">12 hoàn thành</span>
          </div>
          <div className="stat-badge">
            <span className="stat-icon">🔥</span>
            <span className="stat-text">7 ngày liên tiếp</span>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm bài tập..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Category Filters */}
      <div className="category-filters">
        {categories.map(category => (
          <button
            key={category.id}
            className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category.id as ExerciseCategory)}
          >
            <span className="category-icon">{category.icon}</span>
            <span className="category-name">{category.name}</span>
          </button>
        ))}
      </div>

      {/* Exercises Grid */}
      <div className="exercises-grid">
        {filteredExercises.map(exercise => (
          <div key={exercise.id} className="exercise-card">
            <div className="exercise-icon-wrapper">
              <span className="exercise-icon">{exercise.icon}</span>
            </div>
            <div className="exercise-content">
              <h3 className="exercise-title">{exercise.title}</h3>
              <p className="exercise-description">{exercise.description}</p>
              
              <div className="exercise-meta">
                <span className="meta-item">
                  <span className="meta-icon">⏱️</span>
                  {exercise.duration} phút
                </span>
                <span
                  className="difficulty-badge"
                  style={{ background: getDifficultyColor(exercise.difficulty) }}
                >
                  {getDifficultyLabel(exercise.difficulty)}
                </span>
              </div>

              {exercise.benefits && (
                <div className="exercise-benefits">
                  {exercise.benefits.slice(0, 2).map((benefit, index) => (
                    <span key={index} className="benefit-tag">
                      ✓ {benefit}
                    </span>
                  ))}
                </div>
              )}

              <button className="btn btn-primary btn-sm start-btn">
                Bắt đầu
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>Không tìm thấy bài tập</h3>
          <p>Thử thay đổi từ khóa tìm kiếm hoặc danh mục</p>
        </div>
      )}
    </div>
  );
};

export default Exercises;
