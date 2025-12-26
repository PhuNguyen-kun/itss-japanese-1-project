import React, { useState, useEffect } from "react";
import { Card, Typography, Spin, message } from "antd";
import DefaultLayout from "../../layouts/LayoutDefault";
import StoryCard from "../../components/StoryCard";
import DocumentCard from "../../components/DocumentCard";
import CommentModal from "../../components/CommentModal";
import EditStoryModal from "../../components/EditStoryModal";
import { storyApi, reactionApi, documentApi, savedStoryApi } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const { Title } = Typography;

function Home() {
  const { user } = useAuth();
  const [stories, setStories] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [storyToEdit, setStoryToEdit] = useState(null);
  const [savedStoryIds, setSavedStoryIds] = useState(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [storiesResponse, documentsResponse, savedStoriesResponse] =
        await Promise.all([
          storyApi.getAll(),
          documentApi.getAll({ limit: 50 }),
          savedStoryApi.getAll(),
        ]);
      setStories(storiesResponse.data || []);
      setDocuments(documentsResponse.data || []);

      // Extract saved story IDs
      const savedIds = new Set(
        (savedStoriesResponse.data?.saved_stories || []).map(
          (item) => item.story_id
        )
      );
      setSavedStoryIds(savedIds);
    } catch (error) {
      message.error("データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCommentClick = (story) => {
    setSelectedStory(story);
    setModalVisible(true);
  };

  const handleStoryReactionClick = async (story, reactionType) => {
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

  const handleDocumentReactionClick = async (document, reactionType) => {
    // Documents don't support reactions yet - need migration to add "document" to reaction target_type enum
    message.info("ドキュメントへのリアクションは現在サポートされていません");
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

  const handleEditClick = (story) => {
    setStoryToEdit(story);
    setEditModalVisible(true);
  };

  const handleEditSuccess = () => {
    setEditModalVisible(false);
    setStoryToEdit(null);
    loadData(); // Reload data to show updated story
  };

  return (
    <DefaultLayout selectedKey="home" title="ホーム">
      <div className="mx-auto px-4" style={{ maxWidth: "900px" }}>
        {/* Greeting Card */}
        <Card
          className="rounded-2xl shadow-sm border-0 mb-6"
          style={{ marginBottom: "10px" }}
        >
          <Title level={3} className="!mb-0 text-red-500">
            おかえり！
          </Title>
        </Card>

        {/* Stories and Documents List */}
        {loading ? (
          <div className="text-center py-8">
            <Spin size="large" />
          </div>
        ) : stories.length === 0 && documents.length === 0 ? (
          <Card className="rounded-2xl shadow-sm border border-gray-200 text-center py-8">
            <p className="text-gray-500">まだコンテンツがありません</p>
          </Card>
        ) : (
          <div>
            {/* Combine and sort by created_at */}
            {[...stories, ...documents]
              .sort((a, b) => {
                const dateA = new Date(a.created_at || a.createdAt || 0);
                const dateB = new Date(b.created_at || b.createdAt || 0);
                return dateB - dateA;
              })
              .map((item) => {
                if (item.title && item.content !== undefined) {
                  // It's a story
                  return (
                    <StoryCard
                      key={`story-${item.id}`}
                      story={item}
                      onCommentClick={handleCommentClick}
                      onReactionClick={(storyObj, reactionType) =>
                        handleStoryReactionClick(storyObj, reactionType)
                      }
                      onSaveToggle={handleSaveToggle}
                      isSaved={savedStoryIds.has(item.id)}
                      onEditClick={
                        item.author?.id === user?.id ||
                        item.user_id === user?.id
                          ? handleEditClick
                          : undefined
                      }
                    />
                  );
                } else {
                  // It's a document
                  return (
                    <DocumentCard
                      key={`document-${item.id}`}
                      document={item}
                      onCommentClick={handleCommentClick}
                      onReactionClick={(docObj, reactionType) =>
                        handleDocumentReactionClick(docObj, reactionType)
                      }
                    />
                  );
                }
              })}
          </div>
        )}

        {/* Comment Modal */}
        <CommentModal
          visible={modalVisible}
          story={selectedStory}
          onClose={handleModalClose}
          onUpdate={handleCommentUpdate}
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

export default Home;
