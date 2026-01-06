import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Spin,
  Typography,
  message,
  Avatar,
  Badge,
  Tag,
  Button,
} from "antd";
import {
  FireOutlined,
  LikeOutlined,
  CommentOutlined,
  UserOutlined,
  TrophyOutlined,
  RiseOutlined,
  StarOutlined,
  CloseOutlined,
  FilterOutlined,
} from "@ant-design/icons";
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
  const [allStories, setAllStories] = useState([]); // Store all stories (unfiltered)
  const [stories, setStories] = useState([]); // Displayed stories (filtered)
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true); // Initial loading for entire page
  const [tableLoading, setTableLoading] = useState(false); // Loading only for table
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
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
        topicApi.getTrending(4),
      ]);
      console.log("Stories response:", storiesRes);
      console.log("Topics response:", topicsRes);

      // Sort stories by reactions_count (descending) and add rank
      const sortedStories = (storiesRes.data || [])
        .sort((a, b) => (b.reactions_count || 0) - (a.reactions_count || 0))
        .map((story, index) => ({
          ...story,
          rank: index + 1,
        }));

      setAllStories(sortedStories);
      setStories(sortedStories);
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
    // Reload all stories and re-sort by reactions_count
    try {
      const storiesRes = await storyApi.getTrending(20);
      const sortedStories = (storiesRes.data || [])
        .sort((a, b) => (b.reactions_count || 0) - (a.reactions_count || 0))
        .map((story, index) => ({
          ...story,
          rank: index + 1,
        }));

      setAllStories(sortedStories);

      // Apply current filter if any
      if (selectedTopic) {
        const filtered = sortedStories.filter(
          (story) => story.topic?.id === selectedTopic.id
        );
        setStories(filtered);
      } else {
        setStories(sortedStories);
      }

      // Update selected story if it still exists
      if (selectedStory) {
        const updatedStory = sortedStories.find(
          (s) => s.id === selectedStory.id
        );
        if (updatedStory) {
          setSelectedStory(updatedStory);
        }
      }
    } catch (error) {
      console.error("Failed to update story:", error);
    }
  };

  const handleTopicClick = (topic) => {
    // If clicking the same topic, clear filter
    if (selectedTopic?.id === topic.id) {
      handleClearFilter();
      return;
    }

    setTableLoading(true);
    setCurrentPage(1); // Reset to first page

    // Filter stories by topic
    const filtered = allStories.filter((story) => story.topic?.id === topic.id);

    // Re-rank filtered stories
    const rankedFiltered = filtered
      .sort((a, b) => (b.reactions_count || 0) - (a.reactions_count || 0))
      .map((story, index) => ({
        ...story,
        rank: index + 1,
      }));

    // Simulate a small delay for smooth UX
    setTimeout(() => {
      setStories(rankedFiltered);
      setSelectedTopic(topic);
      setTableLoading(false);
    }, 200);
  };

  const handleClearFilter = () => {
    setTableLoading(true);
    setCurrentPage(1);
    setSelectedTopic(null);

    // Re-rank all stories
    const rankedAll = allStories
      .sort((a, b) => (b.reactions_count || 0) - (a.reactions_count || 0))
      .map((story, index) => ({
        ...story,
        rank: index + 1,
      }));

    // Simulate a small delay for smooth UX
    setTimeout(() => {
      setStories(rankedAll);
      setTableLoading(false);
    }, 200);
  };

  const getRankDisplay = (rank) => {
    const medals = { 1: "🥇", 2: "🥈", 3: "🥉" };
    return medals[rank] || rank;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return { color: "#FFD700", backgroundColor: "#FFF9E6" };
    if (rank === 2) return { color: "#C0C0C0", backgroundColor: "#F5F5F5" };
    if (rank === 3) return { color: "#CD7F32", backgroundColor: "#FFF4E6" };
    return { color: "#666", backgroundColor: "#F8F9FA" };
  };

  const columns = [
    {
      title: "ランク",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      align: "center",
      render: (rank) => {
        if (rank <= 3) {
          return (
            <span
              style={{
                fontSize: "32px",
                display: "block",
                textAlign: "center",
              }}
            >
              {getRankDisplay(rank)}
            </span>
          );
        }
        return (
          <span style={{ fontSize: "16px", fontWeight: "600", color: "#666" }}>
            #{rank}
          </span>
        );
      },
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: "600",
                  marginBottom: "6px",
                  fontSize: "15px",
                  color: "#1a1a1a",
                  lineHeight: "1.4",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  {formatJapaneseDate(record.created_at)}
                </Text>
                {record.topic && (
                  <Tag
                    color="blue"
                    style={{
                      fontSize: "11px",
                      margin: 0,
                      borderRadius: "4px",
                    }}
                  >
                    {record.topic.name}
                  </Tag>
                )}
              </div>
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
        const displayName =
          username ||
          (author ? `${author.first_name} ${author.last_name}` : "Unknown");
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
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
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
            gap: "6px",
            justifyContent: "center",
            padding: "4px 8px",
            borderRadius: "6px",
            backgroundColor: count > 0 ? "#FFF0F0" : "transparent",
          }}
        >
          <LikeOutlined style={{ color: "#FF6767", fontSize: "16px" }} />
          <span
            style={{ fontWeight: "600", color: count > 0 ? "#FF6767" : "#666" }}
          >
            {count || 0}
          </span>
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
            gap: "6px",
            justifyContent: "center",
            padding: "4px 8px",
            borderRadius: "6px",
            backgroundColor: count > 0 ? "#E6F7FF" : "transparent",
          }}
        >
          <CommentOutlined style={{ color: "#1890ff", fontSize: "16px" }} />
          <span
            style={{ fontWeight: "600", color: count > 0 ? "#1890ff" : "#666" }}
          >
            {count || 0}
          </span>
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "32px",
          padding: "0 4px",
        }}
      >
        {/* Bottom: Trending Topics */}
        <Card
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                  boxShadow: "0 4px 12px rgba(24, 144, 255, 0.3)",
                }}
              >
                <RiseOutlined style={{ color: "#FFFFFF", fontSize: "20px" }} />
              </div>
              <span
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  background:
                    "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                今週のトレンドトピック
              </span>
            </div>
          }
          bordered={false}
          style={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            overflow: "hidden",
            background: "linear-gradient(to bottom, #FFFFFF 0%, #FAFAFA 100%)",
          }}
          headStyle={{
            background: "linear-gradient(135deg, #E6F7FF 0%, #FFFFFF 100%)",
            borderBottom: "2px solid #BAE7FF",
            padding: "20px 24px",
          }}
          bodyStyle={{
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "16px",
            }}
          >
            {topics.map((topic, index) => {
              const isTopThree = index < 3;
              const rankColors = [
                {
                  bg: "linear-gradient(135deg, #FFF9E6 0%, #FFF5D6 100%)",
                  border: "#FFD700",
                  icon: "🥇",
                },
                {
                  bg: "linear-gradient(135deg, #F5F5F5 0%, #E8E8E8 100%)",
                  border: "#C0C0C0",
                  icon: "🥈",
                },
                {
                  bg: "linear-gradient(135deg, #FFF4E6 0%, #FFE8D6 100%)",
                  border: "#CD7F32",
                  icon: "🥉",
                },
              ];
              const currentRankStyle = isTopThree ? rankColors[index] : null;

              const isSelected = selectedTopic?.id === topic.id;

              return (
                <Card
                  key={topic.id}
                  hoverable
                  bodyStyle={{ padding: "20px" }}
                  onClick={() => handleTopicClick(topic)}
                  style={{
                    borderRadius: "12px",
                    border: isSelected
                      ? `3px solid #1890ff`
                      : isTopThree
                      ? `2px solid ${currentRankStyle.border}`
                      : "1px solid #e5e7eb",
                    background: isSelected
                      ? "linear-gradient(135deg, #E6F7FF 0%, #BAE7FF 100%)"
                      : isTopThree
                      ? currentRankStyle.bg
                      : "linear-gradient(to bottom, #FFFFFF 0%, #FAFAFA 100%)",
                    boxShadow: isSelected
                      ? `0 4px 16px rgba(24, 144, 255, 0.3)`
                      : isTopThree
                      ? `0 4px 16px rgba(0,0,0,0.1)`
                      : "0 2px 8px rgba(0,0,0,0.06)",
                    transition: "all 0.3s ease",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = isTopThree
                      ? `0 8px 24px rgba(0,0,0,0.15)`
                      : "0 4px 16px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = isTopThree
                      ? `0 4px 16px rgba(0,0,0,0.1)`
                      : "0 2px 8px rgba(0,0,0,0.06)";
                  }}
                >
                  {isTopThree && (
                    <div
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        fontSize: "24px",
                        zIndex: 1,
                      }}
                    >
                      {currentRankStyle.icon}
                    </div>
                  )}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "4px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: isTopThree ? "48px" : "40px",
                          height: isTopThree ? "48px" : "40px",
                          borderRadius: "12px",
                          background: isTopThree
                            ? `linear-gradient(135deg, ${currentRankStyle.border} 0%, ${currentRankStyle.border}CC 100%)`
                            : "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)",
                          boxShadow: isTopThree
                            ? `0 4px 12px ${currentRankStyle.border}40`
                            : "0 4px 12px rgba(24, 144, 255, 0.3)",
                          fontSize: isTopThree ? "20px" : "16px",
                          fontWeight: "700",
                          color: "#FFFFFF",
                        }}
                      >
                        #{index + 1}
                      </div>
                      <Title
                        level={5}
                        style={{
                          margin: 0,
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#1a1a1a",
                          flex: 1,
                        }}
                      >
                        {topic.name}
                      </Title>
                    </div>
                    {topic.description && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "13px",
                          display: "block",
                          lineHeight: "1.6",
                          color: "#666",
                          marginBottom: "8px",
                        }}
                      >
                        {topic.description}
                      </Text>
                    )}
                    <div
                      style={{
                        display: "flex",
                        gap: "20px",
                        fontSize: "13px",
                        flexWrap: "wrap",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background:
                            "linear-gradient(135deg, #E6F7FF 0%, #BAE7FF 100%)",
                        }}
                      >
                        <StarOutlined
                          style={{ color: "#1890ff", fontSize: "14px" }}
                        />
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px", margin: 0 }}
                        >
                          ストーリー:{" "}
                        </Text>
                        <Text
                          strong
                          style={{
                            color: "#1890ff",
                            fontSize: "13px",
                            margin: 0,
                          }}
                        >
                          {topic.story_count || 0}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          borderRadius: "8px",
                          background:
                            "linear-gradient(135deg, #FFF0F0 0%, #FFE5E5 100%)",
                        }}
                      >
                        <FireOutlined
                          style={{ color: "#FF6767", fontSize: "14px" }}
                        />
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px", margin: 0 }}
                        >
                          エンゲージメント:{" "}
                        </Text>
                        <Text
                          strong
                          style={{
                            color: "#FF6767",
                            fontSize: "13px",
                            margin: 0,
                          }}
                        >
                          {topic.total_engagement || 0}
                        </Text>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </Card>

        {/* Top: Ranking Table */}
        <Card
          title={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 0",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    background:
                      "linear-gradient(135deg, #FF6767 0%, #FF8E8E 100%)",
                    boxShadow: "0 4px 12px rgba(255, 103, 103, 0.3)",
                  }}
                >
                  <FireOutlined
                    style={{ color: "#FFFFFF", fontSize: "20px" }}
                  />
                </div>
                <span
                  style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    background:
                      "linear-gradient(135deg, #FF6767 0%, #FF8E8E 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  人気ストーリーランキング
                </span>
                {selectedTopic && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginLeft: "16px",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      background:
                        "linear-gradient(135deg, #E6F7FF 0%, #BAE7FF 100%)",
                      border: "1px solid #91D5FF",
                      animation: "fadeIn 0.3s ease",
                    }}
                  >
                    <FilterOutlined
                      style={{ color: "#1890ff", fontSize: "14px" }}
                    />
                    <Text
                      strong
                      style={{ color: "#1890ff", fontSize: "14px", margin: 0 }}
                    >
                      {selectedTopic.name}
                    </Text>
                    <Button
                      type="text"
                      size="small"
                      icon={<CloseOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearFilter();
                      }}
                      style={{
                        color: "#1890ff",
                        padding: 0,
                        width: "20px",
                        height: "20px",
                        minWidth: "20px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          }
          bordered={false}
          style={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            overflow: "hidden",
            background: "linear-gradient(to bottom, #FFFFFF 0%, #FAFAFA 100%)",
          }}
          headStyle={{
            background: "linear-gradient(135deg, #FFF5F5 0%, #FFFFFF 100%)",
            borderBottom: "2px solid #FFE5E5",
            padding: "20px 24px",
          }}
          bodyStyle={{
            padding: "24px",
          }}
        >
          <Table
            columns={columns}
            dataSource={stories}
            rowKey="id"
            loading={tableLoading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: stories.length,
              showSizeChanger: false,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} / ${total} 件`,
              onChange: (page) => {
                setCurrentPage(page);
                // Scroll to top of table
                const tableElement =
                  document.querySelector(".ant-table-wrapper");
                if (tableElement) {
                  tableElement.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
                }
              },
            }}
            onRow={(record) => ({
              onClick: () => handleStoryClick(record),
              style: {
                cursor: "pointer",
                transition: "all 0.2s ease",
              },
              onMouseEnter: (e) => {
                e.currentTarget.style.backgroundColor = "#F8F9FA";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
              },
              onMouseLeave: (e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              },
            })}
          />
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
