import { useState } from 'react';
import './EmotionDashboard.css';

type TimeRange = '7d' | '30d' | '90d';

const EmotionDashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');

  // Mock data - replace with API
  const moodScore = 7.2;
  const trend = '+12%';
  const totalSessions = 24;
  const averageSessionTime = '32 phút';

  const emotions = [
    { name: 'Vui vẻ', value: 35, color: '#10B981', icon: '😊' },
    { name: 'Bình thường', value: 40, color: '#F59E0B', icon: '😐' },
    { name: 'Lo lắng', value: 15, color: '#EF4444', icon: '😰' },
    { name: 'Buồn bã', value: 10, color: '#8B5CF6', icon: '😢' }
  ];

  const weeklyData = [
    { day: 'T2', joy: 7, sadness: 3, anxiety: 2, neutral: 5 },
    { day: 'T3', joy: 6, sadness: 4, anxiety: 3, neutral: 4 },
    { day: 'T4', joy: 8, sadness: 2, anxiety: 1, neutral: 6 },
    { day: 'T5', joy: 7, sadness: 3, anxiety: 2, neutral: 5 },
    { day: 'T6', joy: 9, sadness: 1, anxiety: 1, neutral: 7 },
    { day: 'T7', joy: 8, sadness: 2, anxiety: 2, neutral: 6 },
    { day: 'CN', joy: 9, sadness: 1, anxiety: 1, neutral: 8 }
  ];

  const insights = [
    {
      icon: '🎯',
      title: 'Xu hướng tích cực',
      description: 'Tâm trạng của bạn đang cải thiện dần trong tuần qua',
      type: 'success'
    },
    {
      icon: '⚠️',
      title: 'Cần chú ý',
      description: 'Mức độ lo lắng tăng nhẹ vào giữa tuần',
      type: 'warning'
    },
    {
      icon: '💡',
      title: 'Gợi ý',
      description: 'Thử bài tập thở sâu vào buổi sáng để bắt đầu ngày tốt hơn',
      type: 'info'
    }
  ];

  const triggers = [
    { name: 'Công việc', count: 12, trend: 'up' },
    { name: 'Mối quan hệ', count: 8, trend: 'down' },
    { name: 'Sức khỏe', count: 5, trend: 'stable' },
    { name: 'Tài chính', count: 3, trend: 'stable' }
  ];

  const getMaxValue = () => {
    const allValues = weeklyData.flatMap(d => [d.joy, d.sadness, d.anxiety, d.neutral]);
    return Math.max(...allValues);
  };

  return (
    <div className="emotion-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div>
            <h1 className="dashboard-title">Dashboard Cảm Xúc</h1>
            <p className="dashboard-subtitle">
              Theo dõi và phân tích trạng thái tinh thần của bạn
            </p>
          </div>
          <div className="time-range-selector">
            <button
              className={`time-btn ${timeRange === '7d' ? 'active' : ''}`}
              onClick={() => setTimeRange('7d')}
            >
              7 ngày
            </button>
            <button
              className={`time-btn ${timeRange === '30d' ? 'active' : ''}`}
              onClick={() => setTimeRange('30d')}
            >
              30 ngày
            </button>
            <button
              className={`time-btn ${timeRange === '90d' ? 'active' : ''}`}
              onClick={() => setTimeRange('90d')}
            >
              90 ngày
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon">😊</div>
          <div className="stat-content">
            <div className="stat-label">Điểm Tâm Trạng</div>
            <div className="stat-value">
              {moodScore}
              <span className="stat-trend positive">{trend}</span>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">�</div>
          <div className="stat-content">
            <div className="stat-label">Tổng Buổi Tư Vấn</div>
            <div className="stat-value">{totalSessions}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-label">Thời Gian Trung Bình</div>
            <div className="stat-value">{averageSessionTime}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Tiến Triển</div>
            <div className="stat-value">Tốt</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Weekly Chart */}
        <div className="dashboard-card chart-card">
          <div className="card-header">
            <h3>Biểu Đồ Tuần</h3>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#10B981' }}></span>
                Vui vẻ
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#F59E0B' }}></span>
                Bình thường
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#EF4444' }}></span>
                Lo lắng
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: '#8B5CF6' }}></span>
                Buồn
              </span>
            </div>
          </div>
          <div className="bar-chart">
            {weeklyData.map((day, index) => {
              const max = getMaxValue();
              return (
                <div key={index} className="bar-group">
                  <div className="bars">
                    <div
                      className="bar joy"
                      style={{ height: `${(day.joy / max) * 100}%` }}
                      title={`Vui vẻ: ${day.joy}`}
                    ></div>
                    <div
                      className="bar neutral"
                      style={{ height: `${(day.neutral / max) * 100}%` }}
                      title={`Bình thường: ${day.neutral}`}
                    ></div>
                    <div
                      className="bar anxiety"
                      style={{ height: `${(day.anxiety / max) * 100}%` }}
                      title={`Lo lắng: ${day.anxiety}`}
                    ></div>
                    <div
                      className="bar sadness"
                      style={{ height: `${(day.sadness / max) * 100}%` }}
                      title={`Buồn: ${day.sadness}`}
                    ></div>
                  </div>
                  <div className="bar-label">{day.day}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Emotion Distribution */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Phân Bố Cảm Xúc</h3>
          </div>
          <div className="emotion-list">
            {emotions.map((emotion, index) => (
              <div key={index} className="emotion-item">
                <div className="emotion-info">
                  <span className="emotion-icon">{emotion.icon}</span>
                  <span className="emotion-name">{emotion.name}</span>
                </div>
                <div className="emotion-progress">
                  <div
                    className="emotion-bar"
                    style={{
                      width: `${emotion.value}%`,
                      background: emotion.color
                    }}
                  ></div>
                  <span className="emotion-percentage">{emotion.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Insights */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Nhận Xét & Gợi Ý</h3>
          </div>
          <div className="insights-list">
            {insights.map((insight, index) => (
              <div key={index} className={`insight-item ${insight.type}`}>
                <div className="insight-icon">{insight.icon}</div>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Triggers */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Yếu Tố Ảnh Hưởng</h3>
          </div>
          <div className="triggers-list">
            {triggers.map((trigger, index) => (
              <div key={index} className="trigger-item">
                <div className="trigger-info">
                  <span className="trigger-name">{trigger.name}</span>
                  <span className="trigger-count">{trigger.count} lần</span>
                </div>
                <span className={`trigger-trend ${trigger.trend}`}>
                  {trigger.trend === 'up' && '↗️'}
                  {trigger.trend === 'down' && '↘️'}
                  {trigger.trend === 'stable' && '→'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmotionDashboard;
