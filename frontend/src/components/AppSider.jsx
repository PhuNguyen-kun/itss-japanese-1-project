// src/components/AppSider.jsx
import React from "react";
import { Layout, Menu, Button } from "antd";
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  BellOutlined,
  FireOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Sider } = Layout;

function AppSider({ selectedKey = "home" }) {
  const navigate = useNavigate();

  const menuItems = [
    {
      key: "home",
      icon: <HomeOutlined />,
      label: "ホーム",
      onClick: () => navigate("/"),
    },
    {
      key: "stories",
      icon: <BookOutlined />,
      label: "ストーリー",
      onClick: () => navigate("/stories"),
    },
    {
      key: "documents",
      icon: <FileTextOutlined />,
      label: "ドキュメント",
      onClick: () => navigate("/documents"),
    },
    {
      key: "notifications",
      icon: <BellOutlined />,
      label: "通知",
      onClick: () => navigate("/notifications"),
    },
    {
      key: "topics",
      icon: <FireOutlined />,
      label: "人気トピック",
      onClick: () => navigate("/topics"),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <Sider
      width={240}
      className="flex flex-col"
      theme="light"
      style={{ backgroundColor: "#ff7b92" }} // 🎨 đỏ hồng
    >
      {/* logo / title */}
      <div className="h-20 flex items-center justify-center border-b"
           style={{ borderColor: "rgba(255,255,255,0.4)" }}>
        <span className="text-white text-lg font-semibold tracking-wide">
          学びシェアBox
        </span>
      </div>

      {/* menu */}
      <div className="flex-1 overflow-hidden">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          style={{
            background: "transparent",
            borderRight: "none",
            padding: "16px 12px",
          }}
          // custom màu item
          inlineIndent={16}
        />
      </div>

      {/* logout dưới cùng */}
      <div className="px-4 pb-6">
        <Button
          block
          type="text"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          className="!flex !items-center !justify-start !text-white !rounded-xl !px-4 !py-2"
          style={{
            backgroundColor: "rgba(255,255,255,0.18)",
          }}
        >
          ログアウト
        </Button>
      </div>
    </Sider>
  );
}

export default AppSider;
