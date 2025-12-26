import React from "react";
import { Layout, Menu, Button, message } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  TagOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const { Sider } = Layout;

function AdminSider({ selectedKey = "dashboard" }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const menuItems = [
    {
      key: "dashboard",
      icon: <DashboardOutlined />,
      label: "管理",
      onClick: () => navigate("/admin/dashboard"),
    },
    {
      key: "members",
      icon: <UserOutlined />,
      label: "メンバー管理",
      onClick: () => navigate("/admin/members"),
    },
    {
      key: "topics",
      icon: <TagOutlined />,
      label: "トピック",
      onClick: () => navigate("/admin/topics"),
    },
  ];

  const handleLogout = async () => {
    await logout();
    message.success("ログアウトしました。");
    navigate("/admin");
  };

  return (
    <Sider
      width={240}
      style={{
        backgroundColor: "#FF6767",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        bottom: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          height: "80px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderBottom: "1px solid rgba(255,255,255,0.4)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "18px",
            fontWeight: "600",
            letterSpacing: "0.05em",
          }}
        >
          学びシェアBox
        </span>
      </div>

      {/* Menu Container - Takes remaining space */}
      <div
        style={{
          flex: "1",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          justifyContent: "flex-end",
          height: "calc(100vh - 90px)",
        }}
      >
        {/* Menu Items */}
        <div style={{ flex: "1", overflow: "auto" }}>
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            style={{
              background: "transparent",
              borderRight: "none",
              padding: "16px 12px",
              height: "100%",
            }}
            theme="dark"
            inlineIndent={16}
            className="sidebar-menu"
          />
        </div>

        <div
          style={{
            padding: "16px",
            flexShrink: 0,
            marginTop: "auto",
          }}
        >
          <Button
            block
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            className="!flex !items-center !justify-start !text-white !rounded-xl !px-4 !py-2"
            style={{
              backgroundColor: "rgba(255,255,255,0.18)",
              border: "none",
            }}
          >
            ログアウト
          </Button>
        </div>
      </div>
    </Sider>
  );
}

export default AdminSider;

