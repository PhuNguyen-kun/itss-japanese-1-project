import React from "react";
import { Layout, Typography, Avatar, Space } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useAuth } from "../contexts/AuthContext";

const { Header } = Layout;
const { Text } = Typography;

function AppHeader({ title = "ホーム" }) {
  const { user } = useAuth();

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
          <Avatar icon={<UserOutlined />} />
          <Text strong>{user?.username || "ユーザー名"}</Text>
        </Space>
      </div>
    </Header>
  );
}

export default AppHeader;
