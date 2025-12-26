import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Avatar,
  Typography,
  Button,
  Tabs,
  Space,
  Spin,
  message,
  Empty,
} from "antd";
import { UserOutlined, EditOutlined, CameraOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import DefaultLayout from "../../layouts/LayoutDefault";
import StoryCard from "../../components/StoryCard";
import CommentModal from "../../components/CommentModal";
import EditStoryModal from "../../components/EditStoryModal";
import FollowersModal from "../../components/FollowersModal";
import EditProfileModal from "../../components/EditProfileModal";
import {
  authApi,
  storyApi,
  reactionApi,
  savedStoryApi,
  followApi,
} from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function Profile() {
  const { userId } = useParams();
  const { user: currentUser, setUser } = useAuth();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState([]);
  const [savedStories, setSavedStories] = useState([]);
  const [activeTab, setActiveTab] = useState("posts");
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [storyToEdit, setStoryToEdit] = useState(null);
  const [savedStoryIds, setSavedStoryIds] = useState(new Set());
  const [storiesLoading, setStoriesLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followersModalVisible, setFollowersModalVisible] = useState(false);
  const [followersModalType, setFollowersModalType] = useState("followers");
  const [editProfileModalVisible, setEditProfileModalVisible] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef(null);

  const isOwnProfile = !userId || userId === String(currentUser?.id);

  useEffect(() => {
    loadProfile();
  }, [userId, currentUser]);

  useEffect(() => {
    if (profileUser) {
      if (activeTab === "posts") {
        loadUserStories();
      } else if (activeTab === "saved") {
        loadSavedStories();
      }
    }
  }, [activeTab, profileUser]);

  useEffect(() => {
    if (!isOwnProfile && profileUser) {
      checkFollowStatus();
    }
  }, [isOwnProfile, profileUser]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      let response;
      if (isOwnProfile) {
        response = await authApi.getProfile();
      } else {
        response = await authApi.getUserById(userId);
      }
      setProfileUser(response.data);
    } catch (error) {
      message.error("プロフィールの読み込みに失敗しました");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await followApi.checkIfFollowing(userId);
      setIsFollowing(response.data.is_following);
    } catch (error) {
      console.error("Failed to check follow status:", error);
    }
  };

  const loadUserStories = async () => {
    if (!profileUser) return;
    setStoriesLoading(true);
    try {
      const [storiesResponse, savedStoriesResponse] = await Promise.all([
        storyApi.getAll({ user_id: profileUser.id }),
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
      message.error("投稿の読み込みに失敗しました");
    } finally {
      setStoriesLoading(false);
    }
  };

  const loadSavedStories = async () => {
    if (!isOwnProfile) return;
    setStoriesLoading(true);
    try {
      const response = await savedStoryApi.getAll();
      const savedStoriesData = response.data?.saved_stories || [];
      const storiesData = savedStoriesData.map((item) => item.story);
      setSavedStories(storiesData);

      // All stories in this tab are saved
      const savedIds = new Set(storiesData.map((story) => story.id));
      setSavedStoryIds(savedIds);
    } catch (error) {
      message.error("保存した投稿の読み込みに失敗しました");
    } finally {
      setStoriesLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    setFollowLoading(true);
    try {
      if (isFollowing) {
        await followApi.unfollow(userId);
        setIsFollowing(false);
        message.success("フォローを解除しました");
      } else {
        await followApi.follow(userId);
        setIsFollowing(true);
        message.success("フォローしました");
      }
      // Reload profile to update counts
      await loadProfile();
    } catch (error) {
      message.error("操作に失敗しました");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleCommentClick = (story) => {
    setSelectedStory(story);
    setModalVisible(true);
  };

  const handleReactionClick = async (story, reactionType) => {
    try {
      await reactionApi.toggle({
        target_type: "story",
        target_id: story.id,
        reaction_type: reactionType,
      });

      // Reload the specific story
      const response = await storyApi.getById(story.id);
      const updatedStory = response.data;

      // Update in the appropriate list
      if (activeTab === "posts") {
        setStories((prevStories) =>
          prevStories.map((s) => (s.id === story.id ? updatedStory : s))
        );
      } else {
        setSavedStories((prevStories) =>
          prevStories.map((s) => (s.id === story.id ? updatedStory : s))
        );
      }

      // Update selected story if modal is open
      if (selectedStory?.id === story.id) {
        setSelectedStory(updatedStory);
      }
    } catch (error) {
      message.error("リアクションの送信に失敗しました");
    }
  };

  const handleEditClick = (story) => {
    setStoryToEdit(story);
    setEditModalVisible(true);
  };

  const handleStoryUpdate = async () => {
    if (activeTab === "posts") {
      await loadUserStories();
    } else {
      await loadSavedStories();
    }
    if (selectedStory) {
      try {
        const response = await storyApi.getById(selectedStory.id);
        setSelectedStory(response.data);
      } catch (error) {
        console.error("Failed to update story:", error);
      }
    }
  };

  const handleSaveToggle = async (story) => {
    try {
      const isSaved = savedStoryIds.has(story.id);
      if (isSaved) {
        await savedStoryApi.unsave(story.id);
        setSavedStoryIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(story.id);
          return newSet;
        });
        message.success("保存を解除しました");

        // If we're on the saved tab, remove it from the list
        if (activeTab === "saved") {
          setSavedStories((prev) => prev.filter((s) => s.id !== story.id));
        }
      } else {
        await savedStoryApi.save(story.id);
        setSavedStoryIds((prev) => new Set([...prev, story.id]));
        message.success("投稿を保存しました");
      }
    } catch (error) {
      message.error("操作に失敗しました");
    }
  };

  const handleProfileUpdate = async () => {
    await loadProfile();
    // Update current user context if editing own profile
    if (isOwnProfile) {
      const response = await authApi.getProfile();
      setUser(response.data);
    }
  };

  const handleAvatarClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("画像ファイルのみアップロードできます");
      return;
    }

    // Validate file size (2MB)
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("画像サイズは2MB以下である必要があります");
      return;
    }

    setUploadingAvatar(true);
    try {
      const response = await authApi.uploadAvatar(file);
      
      // Check if response is successful
      if (!response.success) {
        throw new Error(response.message || "アバターのアップロードに失敗しました");
      }

      if (!response.data) {
        throw new Error("アバターのアップロードに失敗しました");
      }

      message.success("アバターを更新しました");
      
      // Update profile user
      setProfileUser(response.data);
      
      // Update current user context if editing own profile
      if (isOwnProfile) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Avatar upload error:", error);
      const errorMessage = error.response?.data?.message || error.message || "アバターのアップロードに失敗しました";
      message.error(errorMessage);
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const showFollowersModal = (type) => {
    setFollowersModalType(type);
    setFollowersModalVisible(true);
  };

  if (loading) {
    return (
      <DefaultLayout selectedKey="profile" title="プロフィール">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "400px",
          }}
        >
          <Spin size="large" />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout selectedKey="profile" title="プロフィール">
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "24px 16px",
        }}
      >
        {/* Profile Header Card */}
        <Card
          className="rounded-2xl shadow-sm border border-gray-200 mb-4"
          style={{ marginBottom: "24px" }}
        >
          <div style={{ textAlign: "left" }}>
            {/* Avatar and Username */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div style={{ position: "relative", flexShrink: 0 }}>
                <Avatar
                  size={100}
                  src={
                    profileUser?.avatar_url
                      ? `http://localhost:3000${profileUser.avatar_url}`
                      : null
                  }
                  icon={!profileUser?.avatar_url && <UserOutlined />}
                  style={{ backgroundColor: "#e5e7eb" }}
                />
                {isOwnProfile && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleAvatarChange}
                      disabled={uploadingAvatar}
                    />
                    <Button
                      type="primary"
                      shape="circle"
                      icon={<CameraOutlined />}
                      size="small"
                      loading={uploadingAvatar}
                      onClick={handleAvatarClick}
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        width: "32px",
                        height: "32px",
                        minWidth: "32px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                        border: "2px solid white",
                        backgroundColor: "var(--theme-color)",
                      }}
                    />
                  </>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <Title level={3} style={{ margin: 0 }}>
                    {profileUser?.username}
                  </Title>
                  {isOwnProfile ? (
                    <Button
                      type="default"
                      icon={<EditOutlined />}
                      onClick={() => setEditProfileModalVisible(true)}
                    >
                      プロフィールを編集
                    </Button>
                  ) : (
                    <Button
                      type="primary"
                      loading={followLoading}
                      onClick={handleFollowToggle}
                      style={{
                        backgroundColor: isFollowing ? undefined : "var(--theme-color)",
                        borderColor: isFollowing ? undefined : "var(--theme-color)",
                      }}
                    >
                      {isFollowing ? "フォロー中" : "フォロー"}
                    </Button>
                  )}
                </div>

                {/* Profile Stats */}
                <Space size="large" style={{ marginBottom: "16px" }}>
                  <Text>
                    <strong>{profileUser?.story_count || 0}</strong> 投稿
                  </Text>
                  <Text
                    style={{ cursor: "pointer" }}
                    onClick={() => showFollowersModal("followers")}
                  >
                    <strong>{profileUser?.followers_count || 0}</strong>{" "}
                    フォロワー
                  </Text>
                  <Text
                    style={{ cursor: "pointer" }}
                    onClick={() => showFollowersModal("following")}
                  >
                    <strong>{profileUser?.following_count || 0}</strong>{" "}
                    フォロー中
                  </Text>
                </Space>

                {/* Profile Info */}
                <div style={{ marginTop: "12px" }}>
                  <Text
                    strong
                    style={{ display: "block", marginBottom: "8px" }}
                  >
                    {profileUser?.first_name} {profileUser?.last_name}
                  </Text>

                  {profileUser?.bio && (
                    <Text
                      style={{
                        display: "block",
                        marginBottom: "8px",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {profileUser.bio}
                    </Text>
                  )}

                  {profileUser?.specialization && (
                    <Text
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        color: "#666",
                      }}
                    >
                      専門分野：{profileUser.specialization}
                    </Text>
                  )}

                  {profileUser?.current_job && (
                    <Text
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        color: "#666",
                      }}
                    >
                      現在の職務：{profileUser.current_job}
                    </Text>
                  )}

                  {profileUser?.work_experience && (
                    <Text
                      style={{
                        display: "block",
                        marginBottom: "4px",
                        color: "#666",
                      }}
                    >
                      職務経験：{profileUser.work_experience}
                    </Text>
                  )}

                  {profileUser?.department && (
                    <Text
                      style={{
                        display: "block",
                        color: "#666",
                      }}
                    >
                      部門：{profileUser.department.name}
                    </Text>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs for Posts and Saved */}
        <Card
          className="rounded-2xl shadow-sm border border-gray-200"
          bodyStyle={{ padding: 0 }}
        >
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            centered
            style={{ marginBottom: 0 }}
          >
            <TabPane tab="投稿" key="posts">
              <div style={{ padding: "16px" }}>
                {storiesLoading ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "40px",
                    }}
                  >
                    <Spin />
                  </div>
                ) : stories.length === 0 ? (
                  <Empty
                    description="まだ投稿がありません"
                    style={{ padding: "40px 0" }}
                  />
                ) : (
                  stories.map((story) => (
                    <StoryCard
                      key={story.id}
                      story={story}
                      onCommentClick={handleCommentClick}
                      onReactionClick={handleReactionClick}
                      onEditClick={isOwnProfile ? handleEditClick : undefined}
                      onSaveToggle={handleSaveToggle}
                      isSaved={savedStoryIds.has(story.id)}
                    />
                  ))
                )}
              </div>
            </TabPane>
            {isOwnProfile && (
              <TabPane tab="保存済み" key="saved">
                <div style={{ padding: "16px" }}>
                  {storiesLoading ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        padding: "40px",
                      }}
                    >
                      <Spin />
                    </div>
                  ) : savedStories.length === 0 ? (
                    <Empty
                      description="保存した投稿がありません"
                      style={{ padding: "40px 0" }}
                    />
                  ) : (
                    savedStories.map((story) => (
                      <StoryCard
                        key={story.id}
                        story={story}
                        onCommentClick={handleCommentClick}
                        onReactionClick={handleReactionClick}
                        onSaveToggle={handleSaveToggle}
                        isSaved={true}
                      />
                    ))
                  )}
                </div>
              </TabPane>
            )}
          </Tabs>
        </Card>
      </div>

      {/* Comment Modal */}
      <CommentModal
        visible={modalVisible}
        story={selectedStory}
        onClose={() => {
          setModalVisible(false);
          setSelectedStory(null);
        }}
        onCommentAdded={handleStoryUpdate}
      />

      {/* Edit Story Modal */}
      {editModalVisible && (
        <EditStoryModal
          visible={editModalVisible}
          story={storyToEdit}
          onClose={() => {
            setEditModalVisible(false);
            setStoryToEdit(null);
          }}
          onSuccess={() => {
            setEditModalVisible(false);
            setStoryToEdit(null);
            handleStoryUpdate();
          }}
        />
      )}

      {/* Followers/Following Modal */}
      <FollowersModal
        visible={followersModalVisible}
        onClose={() => setFollowersModalVisible(false)}
        userId={profileUser?.id}
        type={followersModalType}
      />

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={editProfileModalVisible}
        onClose={() => setEditProfileModalVisible(false)}
        user={profileUser}
        onSuccess={handleProfileUpdate}
      />
    </DefaultLayout>
  );
}

export default Profile;
