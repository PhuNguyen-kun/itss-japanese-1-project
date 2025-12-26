import React, { useState, useEffect } from "react";
import { Modal, List, Avatar, Button, Spin, message, Empty } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { followApi } from "../api";

function FollowersModal({ visible, onClose, userId, type = "followers" }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    if (visible && userId) {
      loadUsers();
    }
  }, [visible, userId, type]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response =
        type === "followers"
          ? await followApi.getFollowers(userId)
          : await followApi.getFollowing(userId);

      setUsers(
        type === "followers" ? response.data.followers : response.data.following
      );
      setPagination(response.data.pagination);
    } catch (error) {
      message.error("データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    navigate(`/profile/${user.id}`);
    onClose();
  };

  return (
    <Modal
      title={type === "followers" ? "フォロワー" : "フォロー中"}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <Spin size="large" />
        </div>
      ) : users.length === 0 ? (
        <Empty
          description={
            type === "followers"
              ? "フォロワーがいません"
              : "フォロー中のユーザーがいません"
          }
          style={{ padding: "40px 0" }}
        />
      ) : (
        <List
          dataSource={users}
          renderItem={(user) => (
            <List.Item
              style={{ cursor: "pointer", padding: "12px 0" }}
              onClick={() => handleUserClick(user)}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={48}
                    src={
                      user.avatar_url
                        ? `http://localhost:3000${user.avatar_url}`
                        : null
                    }
                    icon={!user.avatar_url && <UserOutlined />}
                  />
                }
                title={
                  <span style={{ fontWeight: 500 }}>
                    {user.username || `${user.first_name} ${user.last_name}`}
                  </span>
                }
                description={
                  user.bio || user.current_job || "プロフィール未設定"
                }
              />
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
}

export default FollowersModal;

