import React, { useState, useEffect } from "react";
import { Table, Card, Spin, Typography, message, Avatar } from "antd";
import { FireOutlined, LikeOutlined, CommentOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { storyApi, topicApi } from "../../api";
import DefaultLayout from "../../layouts/LayoutDefault";
import CommentModal from "../../components/CommentModal";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;

// Date formatting helper - Japanese format: 2025年12月25日
const formatJapaneseDate = (date) => {
  if (!date) return "";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}年${month}月${day}日`;
  } catch (e) {
    return "";
  }
};

function Topics() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const navigate = useNavigate();

  // Helper function to get avatar URL - use current user's avatar from context if author is current user
  const getAvatarUrl = (author) => {
    if (!author) return null;
    const isCurrentUser = author.id === user?.id;
    
    if (isCurrentUser && user?.avatar_url) {
      return `http://localhost:3000${user.avatar_url}`;
    }
    
    if (author.avatar_url) {
      return `http://localhost:3000${author.avatar_url}`;
    }
    
    return null;
  };

  // Helper function to get story image URL (parse JSON if needed)
  const getStoryImageUrl = (story) => {
    if (!story.image_url) return null;
    
    try {
      // Try to parse as JSON (for multiple images)
      const parsed = JSON.parse(story.image_url);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return `http://localhost:3000${parsed[0]}`;
      }
    } catch (e) {
      // If not JSON, treat as single image
    }
    
    // Single image or first image from array
    return `http://localhost:3000${story.image_url}`;
  };

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
      console.log("Stories response:", storiesRes);
      console.log("Topics response:", topicsRes);
      setStories(storiesRes.data || []);
      setTopics(topicsRes.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      message.error("データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleStoryClick = (story) => {
    setSelectedStory(story);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedStory(null);
  };

  const handleStoryUpdate = async () => {
    // Only reload the selected story data, not entire list
    if (selectedStory) {
      try {
        const response = await storyApi.getById(selectedStory.id);
        // Update the story in the list
        setStories((prevStories) =>
          prevStories.map((s) =>
            s.id === selectedStory.id ? { ...response.data, rank: s.rank } : s
          )
        );
        // Update selected story to reflect changes in modal
        setSelectedStory(response.data);
      } catch (error) {
        console.error("Failed to update story:", error);
      }
    }
  };

  const getRankDisplay = (rank) => {
    const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
    return medals[rank] || rank;
  };

  const columns = [
    {
      title: "ランク",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      align: "center",
      render: (rank) => (
        <span style={{ fontSize: "18px", fontWeight: "600" }}>
          {getRankDisplay(rank)}
        </span>
      ),
    },
    {
      title: "ストーリー",
      dataIndex: "title",
      key: "title",
      width: "40%",
      render: (title, record) => {
        const imageUrl = getStoryImageUrl(record);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {imageUrl && (
              <img
                src={imageUrl}
                alt={title}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            )}
            <div>
              <div style={{ fontWeight: "500", marginBottom: "4px" }}>
                {title}
              </div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {formatJapaneseDate(record.created_at)}
              </Text>
            </div>
          </div>
        );
      },
    },
    {
      title: "教師",
      dataIndex: ["author", "username"],
      key: "author",
      width: "15%",
      render: (username, record) => {
        const author = record.author;
        const displayName = username || (author ? `${author.first_name} ${author.last_name}` : "Unknown");
        const avatarUrl = getAvatarUrl(author);
        const authorId = author?.id || record.user_id;
        
        return (
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px",
              cursor: "pointer",
            }}
            onClick={(e) => {
              e.stopPropagation();
              if (authorId) {
                navigate(`/profile/${authorId}`);
              }
            }}
          >
            <Avatar 
              size="small" 
              src={avatarUrl}
              icon={!avatarUrl && <UserOutlined />}
              style={{ 
                backgroundColor: avatarUrl ? "transparent" : "#FF6767",
                flexShrink: 0,
              }}
            >
              {!avatarUrl && displayName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {displayName}
            </span>
          </div>
        );
      },
    },
    {
      title: "トピック",
      dataIndex: ["topic", "name"],
      key: "topic",
      width: "15%",
      render: (topicName) => (
        <Text style={{ fontSize: "14px" }}>{topicName || "-"}</Text>
      ),
    },
    {
      title: "リアクション",
      dataIndex: "reactions_count",
      key: "reactions",
      width: "10%",
      align: "center",
      render: (count) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            justifyContent: "center",
          }}
        >
          <LikeOutlined style={{ color: "#FF6767" }} />
          <span>{count || 0}</span>
        </div>
      ),
    },
    {
      title: "コメント",
      dataIndex: "comment_count",
      key: "comments",
      width: "10%",
      align: "center",
      render: (count) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            justifyContent: "center",
          }}
        >
          <CommentOutlined style={{ color: "#1890ff" }} />
          <span>{count || 0}</span>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <DefaultLayout selectedKey="topics" title="人気トピック">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <Spin size="large" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout selectedKey="topics" title="人気トピック">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Top: Ranking Table */}
        <Card
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              <FireOutlined style={{ color: "#FF6767", fontSize: "20px" }} />
              <span style={{ fontSize: "18px", fontWeight: "600" }}>
                人気ストーリーランキング
              </span>
            </div>
          }
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <Table
            columns={columns}
            dataSource={stories}
            rowKey="id"
            pagination={false}
            onRow={(record) => ({
              onClick: () => handleStoryClick(record),
              style: { cursor: "pointer" },
            })}
          />
        </Card>

        {/* Bottom: Trending Topics */}
        <Card
          title={
            <span style={{ fontSize: "18px", fontWeight: "600" }}>
              今週のトレンドトピック
            </span>
          }
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {topics.map((topic, index) => (
              <Card
                key={topic.id}
                hoverable
                style={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: index < 3 ? "#fff7f0" : "#ffffff",
                }}
                bodyStyle={{ padding: "16px" }}
                onClick={() => navigate(`/stories?topic=${topic.id}`)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginBottom: "8px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "20px",
                          fontWeight: "700",
                          color: "#FF6767",
                        }}
                      >
                        #{index + 1}
                      </span>
                      <Title level={5} style={{ margin: 0, fontSize: "16px" }}>
                        {topic.name}
                      </Title>
                    </div>
                    {topic.description && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "12px",
                          display: "block",
                          marginBottom: "12px",
                        }}
                      >
                        {topic.description}
                      </Text>
                    )}
                    <div
                      style={{ display: "flex", gap: "16px", fontSize: "12px" }}
                    >
                      <span>
                        <Text type="secondary">ストーリー: </Text>
                        <Text strong>{topic.story_count || 0}</Text>
                      </span>
                      <span>
                        <Text type="secondary">エンゲージメント: </Text>
                        <Text strong style={{ color: "#FF6767" }}>
                          {topic.total_engagement || 0}
                        </Text>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>

      {/* Comment Modal */}
      <CommentModal
        visible={modalVisible}
        story={selectedStory}
        onClose={handleModalClose}
        onUpdate={handleStoryUpdate}
      />
    </DefaultLayout>
  );
}

export default Topics;
