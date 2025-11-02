# 🎨 MindCare AI Design System Guide

## Tổng quan
Design system này giúp tất cả các trang có giao diện nhất quán, đẹp mắt và professional.

## 📦 Shared Components

### 1. PageHeader
Dùng cho phần header của mỗi trang.

```tsx
import { PageHeader } from '../components';

<PageHeader
  title="Tên trang"
  subtitle="Mô tả ngắn gọn"
  icon="🎯"
  gradient="teal" // teal | purple | blue | red | green
/>
```

### 2. Card
Component card linh hoạt với nhiều variant.

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '../components';

// Basic Card
<Card variant="bordered" padding="lg" hover>
  <h3>Title</h3>
  <p>Content</p>
</Card>

// Card with Header
<Card variant="elevated" padding="xl">
  <CardHeader 
    title="Card Title"
    subtitle="Subtitle"
    icon="📊"
    action={<button>Action</button>}
  />
  <CardContent>
    Main content here
  </CardContent>
  <CardFooter>
    Footer content
  </CardFooter>
</Card>
```

**Variants:**
- `default` - Border nhẹ
- `bordered` - Border dày hơn
- `elevated` - Có shadow
- `gradient` - Border gradient đẹp

**Padding:**
- `sm` | `md` | `lg` | `xl`

**Hover:**
- `hover={true}` - Có hiệu ứng hover

### 3. StatCard
Dùng cho hiển thị số liệu thống kê.

```tsx
import { StatCard } from '../components';

<StatCard
  icon="📈"
  label="Tổng người dùng"
  value="1,234"
  trend={{ value: "+12%", isPositive: true }}
  color="teal" // teal | blue | purple | red | green | yellow
/>
```

### 4. Badge
Hiển thị trạng thái, nhãn.

```tsx
import { Badge } from '../components';

<Badge variant="teal" size="md">Đang hoạt động</Badge>
<Badge variant="red" size="sm">Khẩn cấp</Badge>
```

### 5. EmptyState
Hiển thị khi không có dữ liệu.

```tsx
import { EmptyState } from '../components';

<EmptyState
  icon="📭"
  title="Chưa có dữ liệu"
  description="Bạn chưa có cuộc trò chuyện nào"
  action={<button className="btn btn-primary">Bắt đầu chat</button>}
/>
```

## 🎨 Color System

### Primary Colors
- **Teal**: `#00A6A6` - Brand color chính
- **Purple**: `#9A7FF0` - Secondary brand color

### Semantic Colors
- **Blue**: `#3B82F6` - Information
- **Green**: `#10B981` - Success
- **Yellow**: `#F59E0B` - Warning
- **Red**: `#EF4444` - Error/Danger

### Neutral Colors
- **Text Primary**: `#0F172A` (slate-900)
- **Text Secondary**: `#475569` (slate-600)
- **Text Tertiary**: `#64748B` (slate-500)
- **Border**: `#E5E7EB` (gray-200)
- **Background**: `#F8FAFC` (slate-50)

## 📐 Layout Structure

### Standard Page Structure
```tsx
<div className="page-name">
  <PageHeader
    title="..."
    subtitle="..."
    icon="..."
    gradient="teal"
  />
  
  <section className="main-section">
    <div className="container">
      {/* Content here */}
    </div>
  </section>
</div>
```

### Grid Layouts
```css
/* 2 columns */
.grid-2 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-xl);
}

/* 3 columns */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-xl);
}

/* 4 columns */
.grid-4 {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
}
```

## 🔘 Buttons

### Primary Button
```tsx
<button className="btn btn-primary">Click me</button>
<button className="btn btn-primary btn-lg">Large</button>
```

### Outline Button
```tsx
<button className="btn btn-outline-teal">Outline</button>
```

### Sizes
- Default
- `btn-lg` - Large
- `btn-sm` - Small
- `btn-block` - Full width

## 📝 Typography

### Headings
```css
h1 { font-size: 2.75rem; font-weight: 800; } /* Page title */
h2 { font-size: 2rem; font-weight: 700; }    /* Section title */
h3 { font-size: 1.5rem; font-weight: 700; }  /* Card title */
```

### Body Text
```css
font-size: 1rem;           /* Normal text */
font-size: 0.875rem;       /* Small text */
line-height: 1.7;          /* Body line height */
```

## 🎯 Quick Start Templates

### Dashboard Page
```tsx
import { PageHeader, StatCard, Card } from '../components';

const Dashboard = () => {
  return (
    <div className="dashboard-page">
      <PageHeader
        title="Dashboard"
        subtitle="Tổng quan hoạt động"
        icon="📊"
        gradient="teal"
      />
      
      <section className="dashboard-section">
        <div className="container">
          {/* Stats */}
          <div className="grid-4">
            <StatCard icon="👥" label="Users" value="1,234" color="teal" />
            <StatCard icon="💬" label="Messages" value="5,678" color="blue" />
            <StatCard icon="⚠️" label="Alerts" value="12" color="red" />
            <StatCard icon="✓" label="Completed" value="890" color="green" />
          </div>
          
          {/* Cards */}
          <div className="grid-2" style={{ marginTop: '2rem' }}>
            <Card variant="elevated" padding="xl">
              <h3>Recent Activity</h3>
              {/* Content */}
            </Card>
            <Card variant="elevated" padding="xl">
              <h3>Quick Actions</h3>
              {/* Content */}
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
```

### List Page
```tsx
import { PageHeader, Card, Badge, EmptyState } from '../components';

const ListPage = () => {
  const items = []; // Your data
  
  return (
    <div className="list-page">
      <PageHeader
        title="Danh sách"
        subtitle="Quản lý danh sách"
        icon="📋"
        gradient="blue"
      />
      
      <section className="list-section">
        <div className="container">
          {items.length > 0 ? (
            <div className="list-grid">
              {items.map(item => (
                <Card key={item.id} variant="bordered" padding="lg" hover>
                  <h3>{item.name}</h3>
                  <Badge variant="teal">{item.status}</Badge>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon="📭"
              title="Chưa có dữ liệu"
              description="Chưa có mục nào trong danh sách"
              action={<button className="btn btn-primary">Thêm mới</button>}
            />
          )}
        </div>
      </section>
    </div>
  );
};
```

### Profile/Settings Page
```tsx
import { PageHeader, Card, CardHeader, CardContent } from '../components';

const ProfilePage = () => {
  return (
    <div className="profile-page">
      <PageHeader
        title="Hồ sơ cá nhân"
        subtitle="Quản lý thông tin của bạn"
        icon="👤"
        gradient="purple"
      />
      
      <section className="profile-section">
        <div className="container">
          <div className="grid-2">
            <Card variant="elevated" padding="xl">
              <CardHeader title="Thông tin cơ bản" icon="📝" />
              <CardContent>
                {/* Form fields */}
              </CardContent>
            </Card>
            
            <Card variant="elevated" padding="xl">
              <CardHeader title="Cài đặt" icon="⚙️" />
              <CardContent>
                {/* Settings */}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};
```

## ✅ Checklist khi làm trang mới

- [ ] Import PageHeader và các components cần thiết
- [ ] Sử dụng PageHeader với gradient phù hợp
- [ ] Wrap content trong `<section>` và `<div className="container">`
- [ ] Sử dụng Card components thay vì div thô
- [ ] Áp dụng grid system cho layout
- [ ] Sử dụng color system nhất quán
- [ ] Add hover effects cho interactive elements
- [ ] Responsive design (test trên mobile)
- [ ] Add EmptyState khi không có data

## 📱 Responsive Breakpoints

```css
@media (max-width: 1024px) { /* Tablet */ }
@media (max-width: 768px)  { /* Mobile */ }
@media (max-width: 480px)  { /* Small mobile */ }
```

## 🎨 Animation Classes

```css
.fade-in { animation: fadeIn 0.3s ease-in; }
.slide-up { animation: slideUp 0.3s ease-out; }
.scale-in { animation: scaleIn 0.2s ease-out; }
```

Sử dụng design system này để đảm bảo tất cả trang đều có giao diện nhất quán và professional! 🚀
