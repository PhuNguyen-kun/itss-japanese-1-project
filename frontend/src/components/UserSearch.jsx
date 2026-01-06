import React, { useState, useEffect, useRef } from "react";
import { Input, List, Avatar, Typography, Popover, Spin, Empty } from "antd";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authApi } from "../api";
import { useAuth } from "../contexts/AuthContext";

const { Text } = Typography;

function UserSearch() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = async (value) => {
    setSearchValue(value);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If empty, clear results
    if (!value || value.trim().length === 0) {
      setUsers([]);
      setVisible(false);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      setLoading(true);
      setVisible(true);
      try {
        const response = await authApi.searchUsers(value.trim(), 10);
        // Filter out current user
        const filteredUsers = (response.data || []).filter(
          (u) => u.id !== user?.id
        );
        setUsers(filteredUsers);
      } catch (error) {
        console.error("Failed to search users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  };

  const handleUserClick = (userId) => {
    setVisible(false);
    setSearchValue("");
    setUsers([]);
    // Small delay to ensure popover closes before navigation
    setTimeout(() => {
      navigate(`/profile/${userId}`);
    }, 100);
  };

  const handleInputFocus = () => {
    if (searchValue && searchValue.trim().length > 0) {
      setVisible(true);
    }
  };

  const handleInputClick = () => {
    if (searchValue && searchValue.trim().length > 0) {
      setVisible(true);
    }
  };

  const getAvatarUrl = (userData) => {
    if (userData?.avatar_url) {
      return `http://localhost:3000${userData.avatar_url}`;
    }
    return null;
  };

  const getUserDisplayName = (userData) => {
    if (userData?.username) {
      return userData.username;
    }
    const fullName = `${userData?.first_name || ""} ${userData?.last_name || ""}`.trim();
    return fullName || userData?.email || "Unknown";
  };

  const searchContent = (
    <div style={{ width: 300, maxHeight: 400, overflowY: "auto" }}>
      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Spin />
        </div>
      ) : users.length === 0 ? (
        <Empty
          description={
            searchValue.trim().length === 0
              ? "ユーザーを検索"
              : "ユーザーが見つかりません"
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ padding: "20px 0" }}
        />
      ) : (
        <List
          dataSource={users}
          renderItem={(userData) => (
            <List.Item
              style={{
                cursor: "pointer",
                padding: "8px 12px",
              }}
              onClick={() => handleUserClick(userData.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f5f5f5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={getAvatarUrl(userData)}
                    icon={!getAvatarUrl(userData) && <UserOutlined />}
                    size={40}
                  />
                }
                title={
                  <Text strong style={{ fontSize: 14 }}>
                    {getUserDisplayName(userData)}
                  </Text>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {userData.department?.name || userData.email}
                  </Text>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={searchContent}
      trigger={[]}
      open={visible}
      onOpenChange={setVisible}
      placement="bottomLeft"
      overlayStyle={{ paddingTop: 0 }}
      overlayInnerStyle={{ padding: 0 }}
    >
      <Input
        ref={inputRef}
        placeholder="ユーザーを検索..."
        prefix={<SearchOutlined />}
        value={searchValue}
        onChange={(e) => handleSearch(e.target.value)}
        onFocus={handleInputFocus}
        onClick={handleInputClick}
        style={{
          width: 300,
          borderRadius: "20px",
        }}
        allowClear
        onClear={() => {
          setSearchValue("");
          setUsers([]);
          setVisible(false);
        }}
      />
    </Popover>
  );
}

export default UserSearch;

