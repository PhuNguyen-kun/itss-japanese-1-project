# 📋 Topics/Ranking Screen - Implementation Plan

## 🎯 Objective

Implement Popular Topics & Ranking page (`/topics`) showing story rankings based on engagement score.

## 📊 Formula

```javascript
engagement_score = reactions_count + comment_count;
```

---

## ✅ Backend - COMPLETED

### 1. Trending Stories API

**Endpoint**: `GET /api/stories/trending?limit=20`

**Files Modified**:

- `backend/src/services/storyService.js` - Added `getTrending()` method
- `backend/src/controllers/storyController.js` - Added `getTrending()` handler
- `backend/src/routes/storyRoutes.js` - Added route

**Implementation**:

```javascript
async getTrending(query = {}) {
  const limit = parseInt(query.limit) || 20;

  const stories = await db.Story.findAll({
    attributes: [
      'id', 'title', 'content', 'image_url',
      'reactions_count', 'comment_count', 'created_at',
      // Computed field for engagement score
      [
        db.sequelize.literal('reactions_count + comment_count'),
        'engagement_score'
      ]
    ],
    include: [
      {
        model: db.User,
        as: 'author',
        attributes: ['id', 'first_name', 'last_name', 'username', 'avatar_url']
      },
      {
        model: db.Topic,
        as: 'topic',
        attributes: ['id', 'name', 'description']
      }
    ],
    order: [[db.sequelize.literal('engagement_score'), 'DESC']],
    limit
  });

  // Add rank field
  return stories.map((story, index) => ({
    ...story.toJSON(),
    rank: index + 1
  }));
}
```

**Response Structure**:

```json
{
  "success": true,
  "message": "Trending stories retrieved successfully",
  "data": [
    {
      "id": 1,
      "title": "Story title",
      "content": "...",
      "image_url": "/uploads/stories/...",
      "reactions_count": 15,
      "comment_count": 8,
      "engagement_score": 23,
      "rank": 1,
      "author": {
        "id": 2,
        "first_name": "John",
        "last_name": "Doe",
        "username": "johndoe",
        "avatar_url": null
      },
      "topic": {
        "id": 1,
        "name": "教育方法",
        "description": "..."
      }
    }
  ]
}
```

---

## 🔜 Backend - TODO

### 2. Trending Topics API

**Endpoint**: `GET /api/topics/trending?limit=5`

**Files to Modify**:

- `backend/src/services/topicService.js` - Add `getTrending()` method
- `backend/src/controllers/topicController.js` - Add `getTrending()` handler
- `backend/src/routes/topicRoutes.js` - Add route

**Implementation Plan**:

```javascript
async getTrending(query = {}) {
  const limit = parseInt(query.limit) || 5;

  const topics = await db.Topic.findAll({
    attributes: [
      'id', 'name', 'description',
      // Count stories per topic
      [
        db.sequelize.literal(`(
          SELECT COUNT(*)
          FROM stories
          WHERE stories.topic_id = Topic.id
        )`),
        'story_count'
      ],
      // Calculate total engagement
      [
        db.sequelize.literal(`(
          SELECT SUM(reactions_count + comment_count)
          FROM stories
          WHERE stories.topic_id = Topic.id
        )`),
        'total_engagement'
      ]
    ],
    order: [[db.sequelize.literal('total_engagement'), 'DESC']],
    limit
  });

  return topics;
}
```

**Expected Response**:

```json
{
  "success": true,
  "message": "Trending topics retrieved successfully",
  "data": [
    {
      "id": 1,
      "name": "教育方法",
      "description": "効果的な教育方法について",
      "story_count": 12,
      "total_engagement": 156
    }
  ]
}
```

---

## 💻 Frontend - TODO

### 3. API Integration

**Files to Create/Modify**:

#### `frontend/src/api/storyApi.js`

```javascript
// Add method:
getTrending: async (limit = 20) => {
  const response = await apiClient.get("/stories/trending", {
    params: { limit },
  });
  return response.data;
};
```

#### `frontend/src/api/topicApi.js`

```javascript
// Add method:
getTrending: async (limit = 5) => {
  const response = await apiClient.get("/topics/trending", {
    params: { limit },
  });
  return response.data;
};
```

---

### 4. Topics Page Component

**File**: `frontend/src/pages/user/Topics.jsx`

**Structure**:

```jsx
import React, { useState, useEffect } from "react";
import { Table, Card, Spin, Typography } from "antd";
import { storyApi, topicApi } from "../../api";
import DefaultLayout from "../../layouts/LayoutDefault";

function Topics() {
  const [stories, setStories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [storiesRes, topicsRes] = await Promise.all([
        storyApi.getTrending(20),
        topicApi.getTrending(5),
      ]);
      setStories(storiesRes.data);
      setTopics(topicsRes.data);
    } catch (error) {
      message.error("データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DefaultLayout selectedKey="topics" title="人気トピック">
      {/* 2-column layout: Table + Sidebar */}
    </DefaultLayout>
  );
}
```

**Layout**:

```
┌─────────────────────────────────────┬──────────────┐
│                                     │              │
│  Ranking Table                      │  Trending    │
│  (70% width)                        │  Topics      │
│                                     │  (30% width) │
│                                     │              │
└─────────────────────────────────────┴──────────────┘
```

---

### 5. Ranking Table Component

**Table Columns**:

| Column     | Width | Content                            |
| ---------- | ----- | ---------------------------------- |
| ランク     | 80px  | 🥇🥈🥉 for top 3, numbers for rest |
| ストーリー | 40%   | Title + thumbnail                  |
| 教師       | 15%   | Author name                        |
| トピック   | 15%   | Topic name                         |
| いいね     | 10%   | reactions_count                    |
| コメント   | 10%   | comment_count                      |

**Implementation**:

```jsx
const columns = [
  {
    title: "ランク",
    dataIndex: "rank",
    width: 80,
    render: (rank) => {
      const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
      return medals[rank] || rank;
    },
  },
  {
    title: "ストーリー",
    dataIndex: "title",
    width: "40%",
    render: (title, record) => (
      <div className="flex items-center gap-3">
        {record.image_url && (
          <img
            src={`http://localhost:3000${record.image_url}`}
            alt={title}
            style={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 8,
            }}
          />
        )}
        <span>{title}</span>
      </div>
    ),
  },
  {
    title: "教師",
    dataIndex: ["author", "first_name"],
    render: (_, record) =>
      `${record.author.first_name} ${record.author.last_name}`,
  },
  {
    title: "トピック",
    dataIndex: ["topic", "name"],
  },
  {
    title: "いいね",
    dataIndex: "reactions_count",
    align: "center",
  },
  {
    title: "コメント",
    dataIndex: "comment_count",
    align: "center",
  },
];

<Table
  columns={columns}
  dataSource={stories}
  rowKey="id"
  pagination={false}
  onRow={(record) => ({
    onClick: () => navigate(`/story/${record.id}`),
    style: { cursor: "pointer" },
  })}
/>;
```

---

### 6. Trending Topics Sidebar

**Component Structure**:

```jsx
<Card title="今週のトレンドトピック" style={{ height: "100%" }}>
  {topics.map((topic) => (
    <Card.Grid
      key={topic.id}
      style={{ width: "100%", cursor: "pointer" }}
      onClick={() => handleTopicClick(topic.id)}
    >
      <Typography.Title level={5}>{topic.name}</Typography.Title>
      <Typography.Text type="secondary">
        {topic.story_count}件のストーリー
      </Typography.Text>
      <br />
      <Typography.Text type="secondary">
        エンゲージメント: {topic.total_engagement}
      </Typography.Text>
    </Card.Grid>
  ))}
</Card>
```

---

### 7. Routing

**File**: `frontend/src/App.jsx`

```jsx
import Topics from "./pages/user/Topics";

// Add route:
<Route
  path="/topics"
  element={
    <ProtectedRoute>
      <Topics />
    </ProtectedRoute>
  }
/>;
```

---

### 8. Navigation Update

**File**: `frontend/src/components/AppSider.jsx`

```jsx
// Menu item already exists:
{
  key: "topics",
  icon: <FireOutlined />,
  label: "人気トピック",
  onClick: () => navigate("/topics"),
}
```

---

## 🎨 Styling Requirements (Figma)

### Colors:

- Background: `#f5f7fb`
- Table header: `#fafafa`
- Row hover: `#f0f0f0`
- Border: `#e5e7eb`

### Spacing:

- Container padding: `24px`
- Table row padding: `16px`
- Card gap: `16px`

### Typography:

- Title: `18px, bold`
- Table text: `14px`
- Secondary text: `12px, gray`

---

## 🧪 Testing Checklist

- [ ] Backend trending stories API returns correct ranking
- [ ] Backend trending topics API returns correct aggregation
- [ ] Frontend fetches and displays data correctly
- [ ] Medals show for top 3 ranks
- [ ] Table rows are clickable and navigate to story detail
- [ ] Trending topics sidebar displays correctly
- [ ] Loading states work
- [ ] Error handling works
- [ ] Responsive design works on mobile
- [ ] Hover effects work as expected

---

## 📝 Future Enhancements (Not in MVP)

1. **Period Filter**: Filter by week/month/all-time
2. **Pagination**: Support more than 20 stories
3. **Topic Filtering**: Click topic to filter table
4. **Real-time Updates**: WebSocket for live ranking
5. **Search**: Search stories in ranking
6. **Export**: Export ranking as CSV/PDF

---

## 🚀 Implementation Order

1. ✅ **Backend trending stories API** - COMPLETED
2. 🔜 **Backend trending topics API**
3. 🔜 **Frontend API integration**
4. 🔜 **Topics page component**
5. 🔜 **Ranking table**
6. 🔜 **Trending topics sidebar**
7. 🔜 **Styling & polish**
8. 🔜 **Testing**

---

## 📌 Important Notes

- **No database migration needed** - Using computed fields
- **Performance**: Can add caching (5-10 min TTL) later
- **Scalability**: Current approach works well for < 10k stories
- **Index optimization**: Consider adding index on `(reactions_count + comment_count)` if needed

---

## 🐛 Known Issues / Considerations

1. **NULL handling**: Topics/authors might be NULL - handle gracefully
2. **Zero engagement**: Stories with 0 reactions & comments should still show
3. **Deleted stories**: Soft-deleted stories should not appear in ranking
4. **Timezone**: created_at should respect user timezone for "this week" filter (future)

---

## 📚 Reference

- **Figma Design**: https://www.figma.com/design/02uAM11AzPeck4K6tSA7RP/Box?node-id=2314-1112
- **SCREENS_LIST.md**: Section 7 - Màn hình Chủ đề / Bài viết phổ biến
- **Related Files**:
  - Backend: `storyService.js`, `topicService.js`
  - Frontend: `Topics.jsx`, `storyApi.js`, `topicApi.js`
