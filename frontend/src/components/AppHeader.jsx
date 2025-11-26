// src/components/AppHeader.jsx
import React, { useState, useEffect } from "react";
import { Layout, Typography, Avatar, Space, Button, Badge, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;
const { Text } = Typography;

function AppHeader({ title = "ホーム", userName = "ユーザー名" }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "token") {
        setIsAuthenticated(!!e.newValue);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    message.success("ログアウトしました。");
    navigate("/login");
  };

  return (
    <Header
      // dùng style để override màu dark mặc định của AntD
      style={{
        backgroundColor: "#f5f7fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        borderBottom: "1px solid #e5e7eb",
        height: 72,
        lineHeight: "72px",
      }}
      className="shadow-sm"
    >
      {/* Bên trái: tiêu đề */}
      <div>
        <Text strong style={{ fontSize: 18, color: "#374151" }}>
          {title}
        </Text>
      </div>

      {/* Bên phải: user info / login buttons */}
      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <Space size="middle" align="center">
            <Avatar icon={<UserOutlined />} />
            <Text strong>{userName}</Text>
            <Badge count={7} />
            {/* Nếu không muốn nút logout ở đây (vì đã có ở sider) thì có thể xoá nút này */}
            <Button size="small" onClick={handleLogout}>
              ログアウト
            </Button>
          </Space>
        ) : (
          <Space>
            <Button onClick={handleLogin}>ログイン</Button>
            <Button type="primary" onClick={handleRegister}>
              新規登録
            </Button>
          </Space>
        )}
      </div>
    </Header>
  );
}

export default AppHeader;
