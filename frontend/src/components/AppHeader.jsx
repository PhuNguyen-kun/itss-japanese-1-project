import React, { useState, useEffect } from "react";
import { Layout, Typography, Avatar, Space, Badge } from "antd";
import { UserOutlined, BellOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { notificationApi } from "../api";

const { Header } = Layout;
const { Text } = Typography;

function AppHeader({ title = "ホーム" }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  
  const isAdminRoute = location.pathname.startsWith("/admin");

  useEffect(() => {
    // Only load unread count for non-admin routes
    if (!isAdminRoute) {
      // Load unread count initially
      loadUnreadCount();

      // Poll for unread count every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);

      return () => clearInterval(interval);
    }
  }, [isAdminRoute]);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationApi.getUnreadCount();
      setUnreadCount(response.data?.unread_count || 0);
    } catch (error) {
      // Silently fail - don't show error to user
      console.error("Failed to load unread count:", error);
    }
  };

  return (
    <Header
      style={{
        backgroundColor: "#f5f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        borderBottom: "1px solid #e5e7eb",
        height: 72,
        lineHeight: "72px",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
      className="shadow-sm"
    >
      <div>
        <Text strong style={{ fontSize: 18, color: "#374151" }}>
          {title}
        </Text>
      </div>

      <div className="flex items-center gap-4">
        <Space size="middle" align="center">
          {!isAdminRoute && (
            <Badge count={unreadCount} offset={[-2, 2]}>
              <BellOutlined
                style={{
                  fontSize: 20,
                  cursor: "pointer",
                  color: "#374151",
                }}
                onClick={() => navigate("/notifications")}
              />
            </Badge>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
            onClick={() => {
              if (isAdminRoute) {
                navigate("/admin/dashboard");
              } else {
                navigate("/profile");
              }
            }}
          >
            <Avatar
              src={
                user?.avatar_url
                  ? `http://localhost:3000${user.avatar_url}`
                  : null
              }
              icon={!user?.avatar_url && <UserOutlined />}
            />
            <Text strong>{user?.username || (isAdminRoute ? "Admin" : "ユーザー名")}</Text>
          </div>
        </Space>
      </div>
    </Header>
  );
}

export default AppHeader;
