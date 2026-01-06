import React, { useState, useEffect, useMemo } from "react";
import {
  Modal,
  Input,
  Button,
  List,
  Avatar,
  Typography,
  Space,
  message,
  Tag,
  Dropdown,
  Modal as ConfirmModal,
} from "antd";
import {
  SendOutlined,
  CommentOutlined,
  LikeOutlined,
  UpOutlined,
  DownOutlined,
  EllipsisOutlined,
  SaveOutlined,
  DownloadOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { commentApi, reactionApi, storyApi, savedStoryApi } from "../api";
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

const { TextArea } = Input;
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

function CommentModal({
  visible,
  story,
  onClose,
  onUpdate,
  onReactionUpdate,
  onEditClick,
  onSaveToggle,
  onDelete,
  isSaved,
}) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [storyReactions, setStoryReactions] = useState([]);
  const [reactionsCount, setReactionsCount] = useState(
    story?.reactions_count || 0
  );
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactionPickerTimeout, setReactionPickerTimeout] = useState(null);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");

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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (reactionPickerTimeout) {
        clearTimeout(reactionPickerTimeout);
      }
    };
  }, [reactionPickerTimeout]);

  useEffect(() => {
    if (visible && story) {
      loadComments();
      loadReactions();
      // Update reactions count from story prop
      if (story.reactions_count !== undefined) {
        setReactionsCount(story.reactions_count);
      }
    }
  }, [visible, story]);

  const loadComments = async () => {
    if (!story) return;
    setLoading(true);
    try {
      const response = await commentApi.getByStoryId(story.id);
      setComments(response.data || []);
    } catch (error) {
      message.error("コメントの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const loadReactions = async () => {
    if (!story) return;
    try {
      const response = await reactionApi.getByTarget("story", story.id);
      setStoryReactions(response.data || []);
    } catch (error) {
      console.error("Failed to load reactions:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!commentText.trim() || !story) return;

    setSubmitting(true);
    try {
      await commentApi.create(story.id, { content: commentText });
      setCommentText("");
      await loadComments();
      // Update parent component's comment count
      if (onUpdate) {
        onUpdate(story.id, comments.length + 1);
      }
      message.success("コメントを投稿しました");
    } catch (error) {
      message.error("コメントの投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId) => {
    if (!replyText.trim() || !story) return;

    setSubmitting(true);
    try {
      await commentApi.create(story.id, {
        content: replyText,
        parent_id: parentId,
      });
      setReplyText("");
      setReplyingTo(null);
      await loadComments();
      message.success("返信を投稿しました");
    } catch (error) {
      message.error("返信の投稿に失敗しました");
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (commentId, voteType) => {
    try {
      // Find comment and user's current vote
      const comment = findCommentById(comments, commentId);
      if (!comment) return;

      const userVote = comment.reactions?.find(
        (r) =>
          (r.user?.id === user?.id || r.user_id === user?.id) &&
          (r.reaction_type === "upvote" || r.reaction_type === "downvote")
      );

      // If clicking same vote, remove it (toggle off)
      if (userVote?.reaction_type === voteType) {
        await reactionApi.delete(userVote.id);
      } else {
        // Create or update vote
        await reactionApi.create({
          target_type: "comment",
          target_id: commentId,
          reaction_type: voteType,
        });
      }

      // Reload comments to get updated vote counts
      await loadComments();
    } catch (error) {
      message.error("投票に失敗しました");
    }
  };

  const findCommentById = (commentsList, id) => {
    for (const comment of commentsList) {
      if (comment.id === id) return comment;
      if (comment.replies) {
        const found = comment.replies.find((r) => r.id === id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleReaction = async (targetType, targetId, reactionType) => {
    try {
      if (targetType === "story") {
        // Find current user's reaction
        const currentUserReaction = storyReactions.find(
          (r) => r.user?.id === user?.id || r.user_id === user?.id
        );

        let updatedReactions = [];
        let newReactionsCount = reactionsCount;

        // If clicking same reaction type, delete it (toggle off)
        if (currentUserReaction?.reaction_type === reactionType) {
          await reactionApi.delete(currentUserReaction.id);
          // Remove from local state
          updatedReactions = storyReactions.filter(
            (r) => r.id !== currentUserReaction.id
          );
          setStoryReactions(updatedReactions);
          // Decrement reactions count
          newReactionsCount = Math.max(0, reactionsCount - 1);
          setReactionsCount(newReactionsCount);
        } else {
          // Create or update reaction
          const response = await reactionApi.create({
            target_type: targetType,
            target_id: targetId,
            reaction_type: reactionType,
          });

          // Update local state
          if (response.data.reaction) {
            if (currentUserReaction) {
              // Replace existing reaction (count stays the same)
              updatedReactions = storyReactions.map((r) =>
                r.id === currentUserReaction.id
                  ? { ...response.data.reaction, user }
                  : r
              );
              setStoryReactions(updatedReactions);
              newReactionsCount = reactionsCount; // Count stays same
            } else {
              // Add new reaction (increment count)
              updatedReactions = [
                ...storyReactions,
                { ...response.data.reaction, user },
              ];
              setStoryReactions(updatedReactions);
              newReactionsCount = reactionsCount + 1;
              setReactionsCount(newReactionsCount);
            }
          } else {
            updatedReactions = storyReactions;
            newReactionsCount = reactionsCount;
          }
        }

        // Notify parent to update story data with reactions info
        if (onReactionUpdate && story) {
          onReactionUpdate(story.id, newReactionsCount, updatedReactions);
        } else if (onUpdate) {
          // Fallback to old callback for backward compatibility
          onUpdate();
        }
      } else if (targetType === "comment") {
        // For comments, just create reaction and reload comments
        await reactionApi.create({
          target_type: targetType,
          target_id: targetId,
          reaction_type: reactionType,
        });
        await loadComments();
      }
    } catch (error) {
      message.error("リアクションの送信に失敗しました");
    }
  };

  const getAuthorName = (author) => {
    if (author) {
      return (
        author.username ||
        `${author.first_name || ""} ${author.last_name || ""}`.trim()
      );
    }
    return "Unknown";
  };

  const getVoteScore = (comment) => {
    if (!comment.reactions) return 0;
    const upvotes = comment.reactions.filter(
      (r) => r.reaction_type === "upvote"
    ).length;
    const downvotes = comment.reactions.filter(
      (r) => r.reaction_type === "downvote"
    ).length;
    return upvotes - downvotes;
  };

  const getUserVote = (comment) => {
    if (!comment.reactions || !user) return null;
    const vote = comment.reactions.find(
      (r) =>
        (r.user?.id === user.id || r.user_id === user.id) &&
        (r.reaction_type === "upvote" || r.reaction_type === "downvote")
    );
    return vote?.reaction_type || null;
  };

  const getTimeAgo = (date) => {
    return formatJapaneseDateTime(date);
  };

  const handleDownloadImage = (imageUrl, index) => {
    if (!imageUrl) {
      message.error("画像URLがありません");
      return;
    }

    const downloadUrl = `http://localhost:3000${imageUrl}`;
    const urlParts = imageUrl.split("/");
    const fileName = urlParts[urlParts.length - 1] || `image-${index + 1}.jpg`;

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
    if (!story) return;
    let images = story.image_urls;
    if (!images && story.image_url) {
      try {
        const parsed = JSON.parse(story.image_url);
        if (Array.isArray(parsed)) {
          images = parsed;
        } else {
          images = [story.image_url];
        }
      } catch (e) {
        images = [story.image_url];
      }
    }
    if (!images || images.length === 0) {
      message.error("ダウンロードできる画像がありません");
      return;
    }

    images.forEach((imageUrl, index) => {
      setTimeout(() => {
        handleDownloadImage(imageUrl, index);
      }, index * 200);
    });
  };

  const handleDelete = () => {
    ConfirmModal.confirm({
      title: "投稿を削除しますか？",
      content: "この操作は取り消せません。",
      okText: "削除",
      cancelText: "キャンセル",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await storyApi.delete(story.id);
          message.success("投稿を削除しました");
          if (onDelete) {
            onDelete(story.id);
          }
          onClose();
        } catch (error) {
          message.error("削除に失敗しました");
        }
      },
    });
  };

  const getReactionSummary = (itemReactions) => {
    if (!itemReactions || itemReactions.length === 0) return null;

    const reactionCounts = {};
    itemReactions.forEach((reaction) => {
      reactionCounts[reaction.reaction_type] =
        (reactionCounts[reaction.reaction_type] || 0) + 1;
    });

    const userReaction = itemReactions.find((r) => r.user?.id === user?.id);

    return { counts: reactionCounts, userReaction };
  };

  // Re-calculate storyReactionSummary whenever reactions state changes
  const storyReactionSummary = useMemo(
    () => getReactionSummary(storyReactions),
    [storyReactions]
  );

  return (
    <Modal
      title="ストーリー"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
      destroyOnClose={false}
      getContainer={() => document.body}
      maskClosable={true}
    >
      {story && (
        <div>
          {(() => {
            // Local variable no longer needed - use outer storyReactionSummary instead

            return (
              <>
                {/* Story Content */}
                <div className="pb-4">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "16px",
                      width: "100%",
                      marginBottom: "16px",
                    }}
                  >
                    <Avatar
                      size={48}
                      src={getAvatarUrl(story.author)}
                      icon={
                        !getAvatarUrl(story.author) && (
                          <span>{getAuthorName(story.author)[0]}</span>
                        )
                      }
                      style={{
                        backgroundColor: "#e5e7eb",
                        flexShrink: 0,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        const authorId = story.author?.id || story.user_id;
                        if (authorId) {
                          window.location.href = `/profile/${authorId}`;
                        }
                      }}
                    />
                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        width: "100%",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          textAlign: "left",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          width: "100%",
                          marginTop: "8px",
                          marginBottom: "12px",
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
                              const authorId =
                                story.author?.id || story.user_id;
                              if (authorId) {
                                window.location.href = `/profile/${authorId}`;
                              }
                            }}
                          >
                            {getAuthorName(story.author)}
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
                            {getTimeAgo(story.createdAt || story.created_at)}
                          </Text>
                          {story.topic && (
                            <div style={{ marginTop: 8, textAlign: "left" }}>
                              <Tag color="blue" style={{ fontSize: "12px" }}>
                                {story.topic.name}
                              </Tag>
                            </div>
                          )}
                        </div>
                        {(story.author?.id === user?.id ||
                          story.user_id === user?.id ||
                          onSaveToggle) && (
                          <Dropdown
                            menu={{
                              items: [
                                ...(onSaveToggle
                                  ? [
                                      {
                                        key: "save",
                                        label: isSaved ? "保存を解除" : "保存",
                                        icon: <SaveOutlined />,
                                        onClick: () =>
                                          onSaveToggle && onSaveToggle(story),
                                      },
                                    ]
                                  : []),
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
                                (story.author?.id === user?.id ||
                                  story.user_id === user?.id)
                                  ? [
                                      {
                                        key: "edit",
                                        label: "編集",
                                        icon: <EditOutlined />,
                                        onClick: () => onEditClick(story),
                                      },
                                    ]
                                  : []),
                                ...(story.author?.id === user?.id ||
                                story.user_id === user?.id
                                  ? [
                                      {
                                        key: "delete",
                                        label: "削除",
                                        icon: <DeleteOutlined />,
                                        danger: true,
                                        onClick: handleDelete,
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
                        )}
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
                    </div>
                  </div>

                  {/* Story Images - Facebook Style (same as StoryCard) */}
                  {(story.image_urls || story.image_url) &&
                    (() => {
                      // Parse image_url if it's a JSON string
                      let images = story.image_urls;
                      if (!images && story.image_url) {
                        try {
                          // Try to parse as JSON (for multiple images stored as JSON string)
                          const parsed = JSON.parse(story.image_url);
                          if (Array.isArray(parsed)) {
                            images = parsed;
                          } else {
                            images = [story.image_url];
                          }
                        } catch (e) {
                          // If not JSON, treat as single image string
                          images = [story.image_url];
                        }
                      }
                      const imageCount = images?.length || 0;

                      // Facebook-style layout
                      const getImageLayout = () => {
                        if (imageCount === 1) {
                          return (
                            <div
                              style={{
                                width: "100%",
                                maxWidth: "100%",
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
                                  maxWidth: "100%",
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
                          return (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "2px",
                                width: "100%",
                                maxWidth: "100%",
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
                                        index === 0
                                          ? "12px 0 0 12px"
                                          : "0 12px 12px 0",
                                      border: "1px solid #e5e7eb",
                                      display: "block",
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          );
                        } else if (imageCount === 3) {
                          return (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gridTemplateRows: "repeat(2, 1fr)",
                                gap: "2px",
                                width: "100%",
                                maxWidth: "100%",
                                height: "400px",
                              }}
                            >
                              <div
                                style={{
                                  cursor: "pointer",
                                  gridRow: "span 2",
                                  overflow: "hidden",
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
                              {images.slice(1, 3).map((url, index) => (
                                <div
                                  key={index + 1}
                                  style={{
                                    cursor: "pointer",
                                    position: "relative",
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
                                        index === 0
                                          ? "0 12px 0 0"
                                          : "0 0 12px 0",
                                      border: "1px solid #e5e7eb",
                                      display: "block",
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          );
                        } else if (imageCount === 4) {
                          return (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gridTemplateRows: "1fr 1fr",
                                gap: "2px",
                                width: "100%",
                                maxWidth: "100%",
                                height: "400px",
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
                          // 5+ images
                          return (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gridTemplateRows: "1fr 1fr",
                                gap: "2px",
                                width: "100%",
                                maxWidth: "100%",
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
                                        fontSize: "32px",
                                        fontWeight: "normal",
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

                      return (
                        <div
                          className="mb-4"
                          style={{
                            width: "100%",
                            maxWidth: "100%",
                            overflow: "hidden",
                          }}
                        >
                          {getImageLayout()}
                        </div>
                      );
                    })()}

                  {/* Reactions Count and Summary */}
                  {(reactionsCount > 0 || storyReactionSummary) && (
                    <div className="mb-3 flex items-center gap-2">
                      {reactionsCount > 0 && (
                        <Text
                          type="secondary"
                          style={{ fontSize: 14, marginRight: 4 }}
                        >
                          {reactionsCount} リアクション
                        </Text>
                      )}
                      {storyReactionSummary && (
                        <>
                          {Object.entries(storyReactionSummary.counts).map(
                            ([type, count]) => (
                              <Tag
                                key={type}
                                color={reactionColors[type]}
                                style={{
                                  cursor: "pointer",
                                  fontSize: "16px",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "4px",
                                }}
                                onClick={() =>
                                  handleReaction("story", story.id, type)
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
                        if (reactionPickerTimeout) {
                          clearTimeout(reactionPickerTimeout);
                          setReactionPickerTimeout(null);
                        }
                        setShowReactionPicker(true);
                      }}
                      onMouseLeave={() => {
                        const timeout = setTimeout(() => {
                          setShowReactionPicker(false);
                        }, 300);
                        setReactionPickerTimeout(timeout);
                      }}
                    >
                      {!storyReactionSummary?.userReaction && (
                        <Button
                          type="text"
                          icon={<LikeOutlined />}
                          onClick={() => {
                            setShowReactionPicker(false);
                            if (reactionPickerTimeout) {
                              clearTimeout(reactionPickerTimeout);
                              setReactionPickerTimeout(null);
                            }
                            handleReaction("story", story.id, "like");
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
                      {storyReactionSummary?.userReaction && (
                        <Button
                          type="text"
                          onClick={() => {
                            const currentType =
                              storyReactionSummary.userReaction.reaction_type;
                            setShowReactionPicker(false);
                            if (reactionPickerTimeout) {
                              clearTimeout(reactionPickerTimeout);
                              setReactionPickerTimeout(null);
                            }
                            handleReaction("story", story.id, currentType);
                          }}
                          style={{
                            color:
                              reactionColors[
                                storyReactionSummary.userReaction.reaction_type
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
                            {
                              reactionIcons[
                                storyReactionSummary.userReaction.reaction_type
                              ]
                            }
                          </span>
                          <span>
                            {(() => {
                              const reactionType =
                                storyReactionSummary.userReaction.reaction_type;
                              const reaction = reactions.find(
                                (r) => r.type === reactionType
                              );
                              return reaction?.label || "いいね";
                            })()}
                          </span>
                        </Button>
                      )}
                      {showReactionPicker && (
                        <div
                          onMouseEnter={() => {
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
                              storyReactionSummary?.userReaction?.reaction_type
                            }
                            onSelect={(reactionType) => {
                              handleReaction("story", story.id, reactionType);
                              setShowReactionPicker(false);
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <Button
                      type="text"
                      icon={<CommentOutlined />}
                      style={{
                        color: "#666",
                        border: "none",
                        outline: "none",
                        boxShadow: "none",
                      }}
                    >
                      コメント {story.comment_count || comments.length}
                    </Button>
                  </div>
                </div>

                {/* Comments List - Reddit Style */}
                <div className="mb-4">
                  <List
                    loading={loading}
                    dataSource={comments}
                    locale={{ emptyText: "コメントはまだありません" }}
                    renderItem={(comment) => {
                      const voteScore = getVoteScore(comment);
                      const userVote = getUserVote(comment);

                      return (
                        <div key={comment.id}>
                          {/* Parent Comment */}
                          <List.Item
                            style={{
                              borderBottom: "none",
                              padding: "12px 0",
                              alignItems: "flex-start",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                gap: "8px",
                                width: "100%",
                              }}
                            >
                              {/* Avatar */}
                              <Avatar
                                size={24}
                                src={getAvatarUrl(comment.author)}
                                icon={
                                  !getAvatarUrl(comment.author) && (
                                    <span style={{ fontSize: "12px" }}>
                                      {getAuthorName(comment.author)[0]}
                                    </span>
                                  )
                                }
                                style={{
                                  backgroundColor: "#e5e7eb",
                                  flexShrink: 0,
                                }}
                              />

                              {/* Comment Content */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "8px",
                                    marginBottom: "4px",
                                  }}
                                >
                                  <Text strong style={{ fontSize: "13px" }}>
                                    {getAuthorName(comment.author)}
                                  </Text>
                                  <Text
                                    type="secondary"
                                    style={{ fontSize: "12px" }}
                                  >
                                    {getTimeAgo(
                                      comment.createdAt || comment.created_at
                                    )}
                                  </Text>
                                </div>
                                <Paragraph
                                  style={{
                                    marginBottom: "8px",
                                    fontSize: "14px",
                                    marginLeft: 0,
                                  }}
                                >
                                  {comment.content}
                                </Paragraph>
                                {/* Action Buttons - Vote + Reply */}
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "4px",
                                    alignItems: "center",
                                  }}
                                >
                                  <Button
                                    type="text"
                                    size="small"
                                    onClick={() =>
                                      handleVote(comment.id, "upvote")
                                    }
                                    style={{
                                      color:
                                        userVote === "upvote"
                                          ? "#ff4500"
                                          : "#878A8C",
                                      padding: "4px 8px",
                                      height: "auto",
                                      fontSize: "12px",
                                      border: "none",
                                      outline: "none",
                                      boxShadow: "none",
                                    }}
                                    onMouseDown={(e) => e.preventDefault()}
                                  >
                                    <span
                                      style={{
                                        fontWeight:
                                          userVote === "upvote"
                                            ? "bold"
                                            : "normal",
                                        display: "inline-flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <UpOutlined />
                                    </span>
                                  </Button>
                                  <Text
                                    strong
                                    style={{
                                      fontSize: "12px",
                                      color:
                                        userVote === "upvote"
                                          ? "#ff4500"
                                          : userVote === "downvote"
                                          ? "#7193ff"
                                          : "#1c1c1c",
                                      minWidth: "20px",
                                      textAlign: "center",
                                    }}
                                  >
                                    {voteScore}
                                  </Text>
                                  <Button
                                    type="text"
                                    size="small"
                                    onClick={() =>
                                      handleVote(comment.id, "downvote")
                                    }
                                    style={{
                                      color:
                                        userVote === "downvote"
                                          ? "#7193ff"
                                          : "#878A8C",
                                      padding: "4px 8px",
                                      height: "auto",
                                      fontSize: "12px",
                                      border: "none",
                                      outline: "none",
                                      boxShadow: "none",
                                    }}
                                    onMouseDown={(e) => e.preventDefault()}
                                  >
                                    <span
                                      style={{
                                        fontWeight:
                                          userVote === "downvote"
                                            ? "bold"
                                            : "normal",
                                        display: "inline-flex",
                                        alignItems: "center",
                                      }}
                                    >
                                      <DownOutlined />
                                    </span>
                                  </Button>
                                  <div
                                    style={{
                                      width: "1px",
                                      height: "16px",
                                      backgroundColor: "#e5e7eb",
                                      margin: "0 4px",
                                    }}
                                  />
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<CommentOutlined />}
                                    onClick={() =>
                                      setReplyingTo({
                                        commentId: comment.id,
                                        authorName: getAuthorName(
                                          comment.author
                                        ),
                                      })
                                    }
                                    style={{
                                      fontSize: "12px",
                                      color: "#878A8C",
                                      padding: "4px 8px",
                                      height: "auto",
                                    }}
                                  />
                                </div>

                                {/* Reply Input */}
                                {replyingTo?.commentId === comment.id && (
                                  <div
                                    style={{
                                      marginTop: "12px",
                                      marginLeft: "32px",
                                    }}
                                  >
                                    <div style={{ marginBottom: "8px" }}>
                                      <Text
                                        type="secondary"
                                        style={{ fontSize: "12px" }}
                                      >
                                        {replyingTo.authorName}さんに返信
                                      </Text>
                                    </div>
                                    <div
                                      style={{ display: "flex", gap: "8px" }}
                                    >
                                      <Input.TextArea
                                        value={replyText}
                                        onChange={(e) =>
                                          setReplyText(e.target.value)
                                        }
                                        placeholder="返信を書く..."
                                        rows={2}
                                        style={{ flex: 1 }}
                                      />
                                      <div
                                        style={{
                                          display: "flex",
                                          flexDirection: "column",
                                          gap: "4px",
                                        }}
                                      >
                                        <Button
                                          type="primary"
                                          size="small"
                                          onClick={() =>
                                            handleSubmitReply(comment.id)
                                          }
                                          loading={submitting}
                                          disabled={!replyText.trim()}
                                        >
                                          投稿
                                        </Button>
                                        <Button
                                          size="small"
                                          onClick={() => {
                                            setReplyingTo(null);
                                            setReplyText("");
                                          }}
                                        >
                                          キャンセル
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Nested Replies */}
                                {comment.replies &&
                                  comment.replies.length > 0 && (
                                    <div
                                      style={{
                                        marginTop: "12px",
                                        marginLeft: "32px",
                                        borderLeft: "2px solid #edeff1",
                                        paddingLeft: "12px",
                                      }}
                                    >
                                      {comment.replies.map((reply) => {
                                        const replyVoteScore =
                                          getVoteScore(reply);
                                        const replyUserVote =
                                          getUserVote(reply);

                                        return (
                                          <div
                                            key={reply.id}
                                            style={{ marginBottom: "12px" }}
                                          >
                                            <div
                                              style={{
                                                display: "flex",
                                                gap: "6px",
                                              }}
                                            >
                                              {/* Reply Avatar */}
                                              <Avatar
                                                size={20}
                                                src={getAvatarUrl(reply.author)}
                                                icon={
                                                  !getAvatarUrl(
                                                    reply.author
                                                  ) && (
                                                    <span
                                                      style={{
                                                        fontSize: "10px",
                                                      }}
                                                    >
                                                      {
                                                        getAuthorName(
                                                          reply.author
                                                        )[0]
                                                      }
                                                    </span>
                                                  )
                                                }
                                                style={{
                                                  backgroundColor: "#e5e7eb",
                                                  flexShrink: 0,
                                                }}
                                              />

                                              {/* Reply Content */}
                                              <div style={{ flex: 1 }}>
                                                <div
                                                  style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: "6px",
                                                    marginBottom: "4px",
                                                  }}
                                                >
                                                  <Text
                                                    strong
                                                    style={{ fontSize: "12px" }}
                                                  >
                                                    {getAuthorName(
                                                      reply.author
                                                    )}
                                                  </Text>
                                                  <Text
                                                    type="secondary"
                                                    style={{ fontSize: "11px" }}
                                                  >
                                                    {getTimeAgo(
                                                      reply.createdAt ||
                                                        reply.created_at
                                                    )}
                                                  </Text>
                                                </div>
                                                <Paragraph
                                                  style={{
                                                    marginBottom: "6px",
                                                    fontSize: "13px",
                                                  }}
                                                >
                                                  {reply.content}
                                                </Paragraph>
                                                {/* Reply Action Buttons */}
                                                <div
                                                  style={{
                                                    display: "flex",
                                                    gap: "4px",
                                                    alignItems: "center",
                                                  }}
                                                >
                                                  <Button
                                                    type="text"
                                                    size="small"
                                                    onClick={() =>
                                                      handleVote(
                                                        reply.id,
                                                        "upvote"
                                                      )
                                                    }
                                                    style={{
                                                      color:
                                                        replyUserVote ===
                                                        "upvote"
                                                          ? "#ff4500"
                                                          : "#878A8C",
                                                      padding: "2px 6px",
                                                      height: "auto",
                                                      fontSize: "11px",
                                                      border: "none",
                                                      outline: "none",
                                                      boxShadow: "none",
                                                    }}
                                                    onMouseDown={(e) =>
                                                      e.preventDefault()
                                                    }
                                                  >
                                                    <span
                                                      style={{
                                                        fontWeight:
                                                          replyUserVote ===
                                                          "upvote"
                                                            ? "bold"
                                                            : "normal",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                      }}
                                                    >
                                                      <UpOutlined />
                                                    </span>
                                                  </Button>
                                                  <Text
                                                    strong
                                                    style={{
                                                      fontSize: "11px",
                                                      color:
                                                        replyUserVote ===
                                                        "upvote"
                                                          ? "#ff4500"
                                                          : replyUserVote ===
                                                            "downvote"
                                                          ? "#7193ff"
                                                          : "#1c1c1c",
                                                      minWidth: "16px",
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {replyVoteScore}
                                                  </Text>
                                                  <Button
                                                    type="text"
                                                    size="small"
                                                    onClick={() =>
                                                      handleVote(
                                                        reply.id,
                                                        "downvote"
                                                      )
                                                    }
                                                    style={{
                                                      color:
                                                        replyUserVote ===
                                                        "downvote"
                                                          ? "#7193ff"
                                                          : "#878A8C",
                                                      padding: "2px 6px",
                                                      height: "auto",
                                                      fontSize: "11px",
                                                      border: "none",
                                                      outline: "none",
                                                      boxShadow: "none",
                                                    }}
                                                    onMouseDown={(e) =>
                                                      e.preventDefault()
                                                    }
                                                  >
                                                    <span
                                                      style={{
                                                        fontWeight:
                                                          replyUserVote ===
                                                          "downvote"
                                                            ? "bold"
                                                            : "normal",
                                                        display: "inline-flex",
                                                        alignItems: "center",
                                                      }}
                                                    >
                                                      <DownOutlined />
                                                    </span>
                                                  </Button>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </List.Item>
                        </div>
                      );
                    }}
                  />
                </div>

                {/* Comment Input */}
                <div className="flex gap-2">
                  <TextArea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="コメントを書く..."
                    rows={2}
                    onPressEnter={(e) => {
                      if (e.shiftKey) return;
                      e.preventDefault();
                      handleSubmitComment();
                    }}
                  />
                  <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmitComment}
                    loading={submitting}
                    disabled={!commentText.trim()}
                  >
                    投稿
                  </Button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* Image Viewer Modal */}
      <ImageViewer
        visible={imageViewerVisible}
        images={(() => {
          if (story?.image_urls) {
            return story.image_urls;
          }
          if (story?.image_url) {
            try {
              const parsed = JSON.parse(story.image_url);
              if (Array.isArray(parsed)) {
                return parsed;
              }
            } catch (e) {
              // Not JSON, treat as single image
            }
            return [story.image_url];
          }
          return [];
        })()}
        initialIndex={selectedImageIndex}
        onClose={() => setImageViewerVisible(false)}
      />
    </Modal>
  );
}

export default CommentModal;
