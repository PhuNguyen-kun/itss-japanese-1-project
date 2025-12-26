import React, { useState, useEffect } from "react";
import {
  Card,
  Avatar,
  Typography,
  Space,
  Button,
  Tag,
  Dropdown,
  message,
} from "antd";
import {
  CommentOutlined,
  LikeOutlined,
  HeartOutlined,
  SmileOutlined,
  CheckCircleOutlined,
  FrownOutlined,
  EditOutlined,
  EllipsisOutlined,
  SaveOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import ReactionPicker from "./ReactionPicker";
import ImageViewer from "./ImageViewer";
// Date formatting helper - Japanese format: 2025年12月25日 16:20:57
const formatJapaneseDateTime = (date) => {
  if (!date) return "";
  try {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    const seconds = String(d.getSeconds()).padStart(2, "0");
    return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    return "";
  }
};

const { Text, Paragraph } = Typography;

const reactionIcons = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  support: "💪",
  sad: "😢",
};

const reactionColors = {
  like: "#1890ff",
  love: "#eb2f96",
  haha: "#faad14",
  support: "#52c41a",
  sad: "#722ed1",
};

const reactions = [
  { type: "like", label: "いいね" },
  { type: "love", label: "愛" },
  { type: "haha", label: "ははは" },
  { type: "support", label: "サポート" },
  { type: "sad", label: "悲しい" },
];

function StoryCard({
  story,
  onCommentClick,
  onReactionClick,
  onEditClick,
  onSaveToggle,
  isSaved,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Get avatar URL - use current user's avatar from context if author is current user
  const getAvatarUrl = () => {
    const authorId = story.author?.id || story.user_id;
    const isCurrentUser = authorId === user?.id;

    if (isCurrentUser && user?.avatar_url) {
      return `http://localhost:3000${user.avatar_url}`;
    }

    if (story.author?.avatar_url) {
      return `http://localhost:3000${story.author.avatar_url}`;
    }

    return null;
  };
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionPickerTimeout, setReactionPickerTimeout] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (reactionPickerTimeout) {
        clearTimeout(reactionPickerTimeout);
      }
    };
  }, [reactionPickerTimeout]);

  const getAuthorName = () => {
    if (story.author) {
      return (
        story.author.username ||
        `${story.author.first_name} ${story.author.last_name}`
      );
    }
    return "Unknown";
  };

  const getTimeAgo = () => {
    return formatJapaneseDateTime(story.created_at || story.createdAt);
  };

  const getReactionSummary = () => {
    if (!story.reactions || story.reactions.length === 0) return null;

    const reactionCounts = {};
    story.reactions.forEach((reaction) => {
      reactionCounts[reaction.reaction_type] =
        (reactionCounts[reaction.reaction_type] || 0) + 1;
    });

    const userReaction = story.reactions.find(
      (r) => r.user?.id === user?.id || r.user_id === user?.id
    );

    return { counts: reactionCounts, userReaction };
  };

  const reactionSummary = getReactionSummary();

  const handleDownloadImage = (imageUrl, index) => {
    if (!imageUrl) {
      message.error("画像URLがありません");
      return;
    }

    const downloadUrl = `http://localhost:3000${imageUrl}`;

    // Extract filename from URL or use default
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1] || `image-${index + 1}.jpg`;

    // Use fetch with blob to force download (same as Documents.jsx for PDF)
    fetch(downloadUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        console.error("Download failed:", error);
        message.error("ダウンロードに失敗しました");
      });
  };

  const handleDownloadAllImages = () => {
    const images =
      story.image_urls || (story.image_url ? [story.image_url] : []);
    if (images.length === 0) {
      message.error("ダウンロードできる画像がありません");
      return;
    }

    images.forEach((imageUrl, index) => {
      setTimeout(() => {
        handleDownloadImage(imageUrl, index);
      }, index * 200); // Delay each download by 200ms to avoid browser blocking
    });
  };

  return (
    <Card
      className="rounded-2xl shadow-sm border border-gray-200 mb-4"
      style={{ marginBottom: "16px" }}
    >
      <Space align="start" size="middle" className="w-full">
        <Avatar
          size={48}
          src={getAvatarUrl()}
          icon={!getAvatarUrl() && <span>{getAuthorName()[0]}</span>}
          style={{
            backgroundColor: "#e5e7eb",
            flexShrink: 0,
            cursor: "pointer",
          }}
          onClick={() => {
            const authorId = story.author?.id || story.user_id;
            if (authorId) {
              navigate(`/profile/${authorId}`);
            }
          }}
        />

        <div className="flex-1" style={{ minWidth: 0, textAlign: "left" }}>
          <div
            className="mt-2 mb-3"
            style={{
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <div>
              <Text
                strong
                style={{
                  fontSize: 18,
                  display: "block",
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onClick={() => {
                  const authorId = story.author?.id || story.user_id;
                  if (authorId) {
                    navigate(`/profile/${authorId}`);
                  }
                }}
              >
                {getAuthorName()}
              </Text>
              <Text
                type="secondary"
                className="text-xs"
                style={{
                  fontSize: 14,
                  display: "block",
                  marginTop: 4,
                  textAlign: "left",
                }}
              >
                {getTimeAgo()}
              </Text>
              {/* Topic Tag */}
              {story.topic && (
                <div style={{ marginTop: 8, textAlign: "left" }}>
                  <Tag color="blue" style={{ fontSize: "12px" }}>
                    {story.topic.name}
                  </Tag>
                </div>
              )}
            </div>
            {/* Three-dot menu */}
            <Dropdown
              menu={{
                items: [
                  {
                    key: "save",
                    label: isSaved ? "保存を解除" : "保存",
                    icon: <SaveOutlined />,
                    onClick: () => onSaveToggle && onSaveToggle(story),
                  },
                  ...(story.image_urls || story.image_url
                    ? [
                        {
                          key: "download",
                          label: "画像をダウンロード",
                          icon: <DownloadOutlined />,
                          onClick: handleDownloadAllImages,
                        },
                      ]
                    : []),
                  ...(onEditClick &&
                  (story.author?.id === user?.id || story.user_id === user?.id)
                    ? [
                        {
                          key: "edit",
                          label: "編集",
                          icon: <EditOutlined />,
                          onClick: () => onEditClick(story),
                        },
                      ]
                    : []),
                ],
              }}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<EllipsisOutlined />}
                style={{
                  color: "#666",
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  fontSize: "20px",
                }}
              />
            </Dropdown>
          </div>

          {story.title && (
            <Text
              strong
              style={{
                fontSize: 16,
                display: "block",
                marginBottom: 8,
                textAlign: "left",
              }}
            >
              {story.title}
            </Text>
          )}

          <Paragraph
            style={{
              marginBottom: 16,
              fontSize: 16,
              color: "#374151",
              whiteSpace: "pre-wrap",
              textAlign: "left",
            }}
          >
            {story.content}
          </Paragraph>

          {/* Story Images - Facebook Style */}
          {(story.image_urls || story.image_url) &&
            (() => {
              const images = story.image_urls || [story.image_url];
              const imageCount = images.length;

              // Facebook-style layout - Improved
              const getImageLayout = () => {
                if (imageCount === 1) {
                  // Single image - show full with max height
                  return (
                    <div
                      style={{
                        width: "100%",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setSelectedImageIndex(0);
                        setImageViewerVisible(true);
                      }}
                    >
                      <img
                        src={`http://localhost:3000${images[0]}`}
                        alt={story.title}
                        style={{
                          width: "100%",
                          maxHeight: "500px",
                          objectFit: "contain",
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          display: "block",
                          backgroundColor: "#f8f9fa",
                        }}
                      />
                    </div>
                  );
                } else if (imageCount === 2) {
                  // Two images - side by side with equal height
                  return (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "2px",
                        width: "100%",
                      }}
                    >
                      {images.map((url, index) => (
                        <div
                          key={index}
                          style={{
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                          }}
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setImageViewerVisible(true);
                          }}
                        >
                          <img
                            src={`http://localhost:3000${url}`}
                            alt={`${story.title} ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "350px",
                              objectFit: "cover",
                              borderRadius:
                                index === 0 ? "12px 0 0 12px" : "0 12px 12px 0",
                              border: "1px solid #e5e7eb",
                              display: "block",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                } else if (imageCount === 3) {
                  // Three images - 1 large on left, 2 stacked on right
                  return (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gridTemplateRows: "repeat(2, 1fr)",
                        gap: "2px",
                        width: "100%",
                        height: "400px",
                      }}
                    >
                      {/* First image spans 2 rows */}
                      <div
                        style={{
                          cursor: "pointer",
                          overflow: "hidden",
                          gridRow: "span 2",
                        }}
                        onClick={() => {
                          setSelectedImageIndex(0);
                          setImageViewerVisible(true);
                        }}
                      >
                        <img
                          src={`http://localhost:3000${images[0]}`}
                          alt={`${story.title} 1`}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: "12px 0 0 12px",
                            border: "1px solid #e5e7eb",
                            display: "block",
                          }}
                        />
                      </div>
                      {/* Second and third images */}
                      {images.slice(1, 3).map((url, index) => (
                        <div
                          key={index + 1}
                          style={{
                            cursor: "pointer",
                            overflow: "hidden",
                          }}
                          onClick={() => {
                            setSelectedImageIndex(index + 1);
                            setImageViewerVisible(true);
                          }}
                        >
                          <img
                            src={`http://localhost:3000${url}`}
                            alt={`${story.title} ${index + 2}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius:
                                index === 0 ? "0 12px 0 0" : "0 0 12px 0",
                              border: "1px solid #e5e7eb",
                              display: "block",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                } else if (imageCount === 4) {
                  // Four images - 2x2 grid
                  return (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gridTemplateRows: "1fr 1fr",
                        gap: "2px",
                        width: "100%",
                        height: "400px",
                      }}
                    >
                      {images.map((url, index) => (
                        <div
                          key={index}
                          style={{
                            cursor: "pointer",
                            overflow: "hidden",
                          }}
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setImageViewerVisible(true);
                          }}
                        >
                          <img
                            src={`http://localhost:3000${url}`}
                            alt={`${story.title} ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius:
                                index === 0
                                  ? "12px 0 0 0"
                                  : index === 1
                                  ? "0 12px 0 0"
                                  : index === 2
                                  ? "0 0 0 12px"
                                  : "0 0 12px 0",
                              border: "1px solid #e5e7eb",
                              display: "block",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  );
                } else {
                  // 5+ images - 2x2 grid with +N overlay
                  return (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gridTemplateRows: "1fr 1fr",
                        gap: "2px",
                        width: "100%",
                        height: "400px",
                      }}
                    >
                      {images.slice(0, 4).map((url, index) => (
                        <div
                          key={index}
                          style={{
                            cursor: "pointer",
                            position: "relative",
                            overflow: "hidden",
                          }}
                          onClick={() => {
                            setSelectedImageIndex(index);
                            setImageViewerVisible(true);
                          }}
                        >
                          <img
                            src={`http://localhost:3000${url}`}
                            alt={`${story.title} ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius:
                                index === 0
                                  ? "12px 0 0 0"
                                  : index === 1
                                  ? "0 12px 0 0"
                                  : index === 2
                                  ? "0 0 0 12px"
                                  : "0 0 12px 0",
                              border: "1px solid #e5e7eb",
                              display: "block",
                            }}
                          />
                          {index === 3 && imageCount > 4 && (
                            <div
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: "rgba(0, 0, 0, 0.6)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                borderRadius: "0 0 12px 0",
                                color: "#fff",
                                fontSize: "28px",
                                fontWeight: "600",
                              }}
                            >
                              +{imageCount - 4}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                }
              };

              return <div className="mb-4">{getImageLayout()}</div>;
            })()}

          {/* Reactions Count and Summary */}
          {(story.reactions_count > 0 || reactionSummary) && (
            <div className="mb-3 flex items-center gap-2">
              {story.reactions_count > 0 && (
                <Text type="secondary" style={{ fontSize: 14, marginRight: 4 }}>
                  {story.reactions_count} リアクション
                </Text>
              )}
              {reactionSummary && (
                <>
                  {Object.entries(reactionSummary.counts).map(
                    ([type, count]) => (
                      <Tag
                        key={type}
                        color={reactionColors[type]}
                        style={{
                          cursor: "pointer",
                          border:
                            reactionSummary.userReaction?.reaction_type === type
                              ? "2px solid"
                              : "none",
                          fontSize: "16px",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                        onClick={() =>
                          onReactionClick && onReactionClick(story, type)
                        }
                      >
                        <span>{reactionIcons[type]}</span>
                        <span>{count}</span>
                      </Tag>
                    )
                  )}
                </>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div
            className="flex items-center gap-4 mt-3"
            style={{ position: "relative" }}
          >
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => {
                // Clear any pending timeout
                if (reactionPickerTimeout) {
                  clearTimeout(reactionPickerTimeout);
                  setReactionPickerTimeout(null);
                }
                setShowReactionPicker(true);
              }}
              onMouseLeave={() => {
                // Delay hiding to allow mouse to move to picker
                const timeout = setTimeout(() => {
                  setShowReactionPicker(false);
                }, 300);
                setReactionPickerTimeout(timeout);
              }}
            >
              {/* Only show basic like button if user hasn't reacted yet */}
              {!reactionSummary?.userReaction && (
                <Button
                  type="text"
                  icon={<LikeOutlined />}
                  onClick={() => {
                    // Hide picker when clicking
                    setShowReactionPicker(false);
                    if (reactionPickerTimeout) {
                      clearTimeout(reactionPickerTimeout);
                      setReactionPickerTimeout(null);
                    }
                    onReactionClick && onReactionClick(story, "like");
                  }}
                  style={{
                    color: "#666",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                    minWidth: "120px",
                    justifyContent: "flex-start",
                  }}
                >
                  <span>いいね</span>
                </Button>
              )}
              {/* Show current reaction if user has reacted */}
              {reactionSummary?.userReaction && (
                <Button
                  type="text"
                  onClick={() => {
                    const currentType =
                      reactionSummary.userReaction.reaction_type;
                    // Hide picker when clicking to toggle off
                    setShowReactionPicker(false);
                    if (reactionPickerTimeout) {
                      clearTimeout(reactionPickerTimeout);
                      setReactionPickerTimeout(null);
                    }
                    onReactionClick && onReactionClick(story, currentType);
                  }}
                  style={{
                    color:
                      reactionColors[
                        reactionSummary.userReaction.reaction_type
                      ],
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                    minWidth: "120px",
                    justifyContent: "flex-start",
                  }}
                >
                  <span style={{ fontSize: "18px" }}>
                    {reactionIcons[reactionSummary.userReaction.reaction_type]}
                  </span>
                  <span>
                    {reactions.find(
                      (r) =>
                        r.type === reactionSummary.userReaction.reaction_type
                    )?.label || "いいね"}
                  </span>
                </Button>
              )}
              {showReactionPicker && (
                <div
                  onMouseEnter={() => {
                    // Clear timeout when mouse enters picker
                    if (reactionPickerTimeout) {
                      clearTimeout(reactionPickerTimeout);
                      setReactionPickerTimeout(null);
                    }
                    setShowReactionPicker(true);
                  }}
                  onMouseLeave={() => {
                    setShowReactionPicker(false);
                  }}
                >
                  <ReactionPicker
                    currentReaction={
                      reactionSummary?.userReaction?.reaction_type
                    }
                    onSelect={(reactionType) => {
                      onReactionClick && onReactionClick(story, reactionType);
                      setShowReactionPicker(false);
                    }}
                  />
                </div>
              )}
            </div>
            <Button
              type="text"
              icon={<CommentOutlined />}
              onClick={() => onCommentClick && onCommentClick(story)}
              style={{
                color: "#666",
                border: "none",
                outline: "none",
                boxShadow: "none",
              }}
            >
              コメント {story.comment_count || 0}
            </Button>
          </div>
        </div>
      </Space>

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={imageViewerVisible}
        images={story.image_urls || (story.image_url ? [story.image_url] : [])}
        initialIndex={selectedImageIndex}
        onClose={() => setImageViewerVisible(false)}
      />
    </Card>
  );
}

export default StoryCard;
