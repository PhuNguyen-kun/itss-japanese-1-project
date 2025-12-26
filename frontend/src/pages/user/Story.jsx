import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, message, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import DefaultLayout from "../../layouts/LayoutDefault";
import StoryCard from "../../components/StoryCard";
import CommentModal from "../../components/CommentModal";
import CreateStoryModal from "../../components/CreateStoryModal";
import EditStoryModal from "../../components/EditStoryModal";
import { storyApi, reactionApi, savedStoryApi } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const { Title } = Typography;

function Story() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [storyToEdit, setStoryToEdit] = useState(null);
  const [savedStoryIds, setSavedStoryIds] = useState(new Set());

  useEffect(() => {
    if (user?.id) {
      loadStories();
    }
  }, [user]);

  const loadStories = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [storiesResponse, savedStoriesResponse] = await Promise.all([
        storyApi.getAll({ user_id: user.id }),
        savedStoryApi.getAll(),
      ]);
      setStories(storiesResponse.data || []);

      // Extract saved story IDs
      const savedIds = new Set(
        (savedStoriesResponse.data?.saved_stories || []).map(
          (item) => item.story_id
        )
      );
      setSavedStoryIds(savedIds);
    } catch (error) {
      message.error("ストーリーの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCommentClick = (story) => {
    setSelectedStory(story);
    setModalVisible(true);
  };

  const handleReactionClick = async (story, reactionType) => {
    // Save current scroll position
    const currentScrollY = window.scrollY;

    try {
      // Find current user's reaction on this story
      const currentUserReaction = story.reactions?.find(
        (r) => r.user_id === user?.id || r.user?.id === user?.id
      );

      // If clicking same reaction type, delete it (toggle off)
      if (currentUserReaction?.reaction_type === reactionType) {
        await reactionApi.delete(currentUserReaction.id);

        // Update local state: remove the reaction and decrement count
        setStories((prevStories) =>
          prevStories.map((s) =>
            s.id === story.id
              ? {
                  ...s,
                  reactions: s.reactions.filter(
                    (r) => r.id !== currentUserReaction.id
                  ),
                  reactions_count: Math.max(0, (s.reactions_count || 0) - 1),
                }
              : s
          )
        );
      } else {
        // Otherwise, create or update reaction
        const response = await reactionApi.create({
          target_type: "story",
          target_id: story.id,
          reaction_type: reactionType,
        });

        // Check if reaction was actually created (not removed)
        if (response.data.reaction) {
          // Update local state: add or replace reaction
          setStories((prevStories) =>
            prevStories.map((s) => {
              if (s.id === story.id) {
                const newReactions = currentUserReaction
                  ? s.reactions.map((r) =>
                      r.id === currentUserReaction.id
                        ? { ...response.data.reaction, user }
                        : r
                    )
                  : [
                      ...(s.reactions || []),
                      { ...response.data.reaction, user },
                    ];
                // Increment count only if adding new reaction (not replacing)
                const newCount = currentUserReaction
                  ? s.reactions_count
                  : (s.reactions_count || 0) + 1;
                return {
                  ...s,
                  reactions: newReactions,
                  reactions_count: newCount,
                };
              }
              return s;
            })
          );
        }
      }

      // Restore scroll position
      requestAnimationFrame(() => {
        window.scrollTo(0, currentScrollY);
      });
    } catch (error) {
      message.error("リアクションの送信に失敗しました");
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedStory(null);
  };

  const handleCommentUpdate = (storyId, newCommentCount) => {
    // Update comment count in local state without reloading
    setStories((prevStories) =>
      prevStories.map((s) =>
        s.id === storyId ? { ...s, comment_count: newCommentCount } : s
      )
    );
  };

  const handleCreateSuccess = () => {
    setCreateModalVisible(false);
    loadStories();
    message.success("ストーリーを投稿しました");
  };

  const handleEditClick = (story) => {
    setStoryToEdit(story);
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setStoryToEdit(null);
    loadStories();
    message.success("ストーリーを更新しました");
  };

  const handleSaveToggle = async (story) => {
    const isSaved = savedStoryIds.has(story.id);

    try {
      if (isSaved) {
        await savedStoryApi.unsave(story.id);
        setSavedStoryIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(story.id);
          return newSet;
        });
        message.success("保存を解除しました");
      } else {
        await savedStoryApi.save(story.id);
        setSavedStoryIds((prev) => new Set(prev).add(story.id));
        message.success("保存しました");
      }
    } catch (error) {
      message.error(isSaved ? "保存解除に失敗しました" : "保存に失敗しました");
    }
  };

  return (
    <DefaultLayout selectedKey="stories" title="ストーリー">
      <div className="mx-auto px-4" style={{ maxWidth: "900px" }}>
        {/* Header with Create Button */}
        <div className="flex justify-between items-center mb-6 mt-4">
          <Title level={3} className="!mb-0">
            新しいストーリー
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setCreateModalVisible(true)}
            style={{
              backgroundColor: "#4a90e2",
              borderColor: "#4a90e2",
              borderRadius: "15px",
            }}
          >
            + ストーリーを追加
          </Button>
        </div>

        {/* Stories List */}
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : stories.length === 0 ? (
          <Card className="rounded-2xl shadow-sm border border-gray-200 text-center py-8">
            <p className="text-gray-500">まだストーリーがありません</p>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
              className="mt-4"
            >
              ストーリーを追加
            </Button>
          </Card>
        ) : (
          <div>
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                onCommentClick={handleCommentClick}
                onReactionClick={(storyObj, reactionType) =>
                  handleReactionClick(storyObj, reactionType)
                }
                onEditClick={handleEditClick}
                onSaveToggle={handleSaveToggle}
                isSaved={savedStoryIds.has(story.id)}
              />
            ))}
          </div>
        )}

        {/* Comment Modal */}
        <CommentModal
          visible={modalVisible}
          story={selectedStory}
          onClose={handleModalClose}
          onUpdate={handleCommentUpdate}
        />

        {/* Create Story Modal */}
        <CreateStoryModal
          visible={createModalVisible}
          onClose={() => setCreateModalVisible(false)}
          onSuccess={handleCreateSuccess}
        />

        {/* Edit Story Modal */}
        <EditStoryModal
          visible={editModalVisible}
          story={storyToEdit}
          onClose={() => {
            setEditModalVisible(false);
            setStoryToEdit(null);
          }}
          onSuccess={handleEditSuccess}
        />
      </div>
    </DefaultLayout>
  );
}

export default Story;
