import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Spin,
  message,
  Button,
  Select,
  Empty,
  Space,
  Tag,
  Pagination,
} from "antd";
import {
  BellOutlined,
  CheckOutlined,
  MessageOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import DefaultLayout from "../../layouts/LayoutDefault";
import { notificationApi } from "../../api";
import { useAuth } from "../../contexts/AuthContext";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

function Notifications() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' or 'unread'
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
  });

  useEffect(() => {
    loadNotifications();
  }, [filter, pagination.current_page]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current_page,
        per_page: pagination.per_page,
      };

      if (filter === "unread") {
        params.is_read = false;
      }

      const response = await notificationApi.getAll(params);
      setNotifications(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      message.error("通知の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationApi.markAsRead(notificationId);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      message.error("既読にできませんでした");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      message.success("すべての通知を既読にしました");
      loadNotifications();
    } catch (error) {
      message.error("既読にできませんでした");
    }
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if not already
    if (!notification.is_read) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate to the related story
    if (notification.entity_type === "story" && notification.entity_id) {
      navigate(`/?storyId=${notification.entity_id}`);
    }
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, current_page: page }));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "comment_on_story":
        return <MessageOutlined style={{ color: "#1890ff" }} />;
      case "reaction_on_story":
        return <HeartOutlined style={{ color: "#ff4d4f" }} />;
      default:
        return <BellOutlined />;
    }
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffInSeconds = Math.floor((now - past) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}秒前`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}分前`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}時間前`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}日前`;
    } else {
      return past.toLocaleDateString("ja-JP");
    }
  };

  return (
    <DefaultLayout selectedKey="notifications" title="通知">
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <Title level={3} style={{ margin: 0 }}>
            <BellOutlined style={{ marginRight: 8 }} />
            通知
          </Title>

          <Space>
            <Select value={filter} onChange={setFilter} style={{ width: 150 }}>
              <Option value="all">すべての通知</Option>
              <Option value="unread">未読のみ</Option>
            </Select>

            <Button
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
              disabled={!notifications.some((n) => !n.is_read) || loading}
            >
              すべて既読にする
            </Button>
          </Space>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <Spin size="large" />
          </div>
        ) : notifications.length === 0 ? (
          <Empty
            description={
              filter === "unread"
                ? "未読の通知はありません"
                : "通知はありません"
            }
            style={{ padding: "60px 0" }}
          />
        ) : (
          <>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              {notifications.map((notification) => (
                <Card
                  key={notification.id}
                  hoverable
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    backgroundColor: notification.is_read
                      ? "#ffffff"
                      : "#e6f7ff",
                    borderLeft: notification.is_read
                      ? "3px solid #d9d9d9"
                      : "3px solid #1890ff",
                    cursor: "pointer",
                  }}
                >
                  <Space align="start" style={{ width: "100%", gap: 20 }}>
                    <div style={{ fontSize: 24, marginTop: 4 }}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          marginBottom: 8,
                        }}
                      >
                        <Space>
                          {notification.actor && (
                            <Text strong>
                              {notification.actor.first_name}{" "}
                              {notification.actor.last_name}
                            </Text>
                          )}
                          {!notification.is_read && (
                            <Tag color="blue">未読</Tag>
                          )}
                        </Space>

                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatTimeAgo(notification.createdAt)}
                        </Text>
                      </div>

                      <Paragraph
                        style={{ margin: 0, color: "#595959" }}
                        ellipsis={{ rows: 2 }}
                      >
                        {notification.message}
                      </Paragraph>

                      {notification.story && (
                        <div
                          style={{
                            marginTop: 8,
                            padding: 8,
                            width: "fit-content",
                            backgroundColor: "#f5f5f5",
                            borderRadius: 4,
                          }}
                        >
                          <Text
                            type="secondary"
                            style={{ fontSize: 12 }}
                            ellipsis
                          >
                            {notification.story.title ||
                              notification.story.content}
                          </Text>
                        </div>
                      )}
                    </div>
                  </Space>
                </Card>
              ))}
            </Space>

            {/* Pagination */}
            {pagination.total > pagination.per_page && (
              <div style={{ marginTop: 24, textAlign: "center" }}>
                <Pagination
                  current={pagination.current_page}
                  pageSize={pagination.per_page}
                  total={pagination.total}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total) => `全 ${total} 件`}
                />
              </div>
            )}
          </>
        )}
      </div>
    </DefaultLayout>
  );
}

export default Notifications;
