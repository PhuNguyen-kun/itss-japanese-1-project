import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Spin,
  message,
  Typography,
  Tag,
  Select,
  Button,
  Space,
  Modal,
  Form,
  Input,
} from "antd";
import {
  EyeOutlined,
  StopOutlined,
  CheckCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import AdminLayout from "../../layouts/AdminLayout";
import { adminApi } from "../../api";

const { Title: AntTitle } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function Members() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    role: undefined,
    status: undefined,
    search: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadUsers();
  }, [pagination.current, filters]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        per_page: pagination.pageSize,
        ...filters,
      };
      const response = await adminApi.getUsers(params);
      setUsers(response.data.users || []);
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to load users:", error);
      message.error("ユーザーリストの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    setPagination({
      ...pagination,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination({ ...pagination, current: 1 });
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await adminApi.getUserById(userId);
      setSelectedUser(response.data);
      setViewModalVisible(true);
    } catch (error) {
      message.error("ユーザー情報の取得に失敗しました");
    }
  };

  const handleEditUser = async (userId) => {
    try {
      const response = await adminApi.getUserById(userId);
      setSelectedUser(response.data);
      form.setFieldsValue({
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email,
        role: response.data.role,
        status: response.data.status,
        bio: response.data.bio,
        current_job: response.data.current_job,
        work_experience: response.data.work_experience,
        specialization: response.data.specialization,
      });
      setEditModalVisible(true);
    } catch (error) {
      message.error("ユーザー情報の取得に失敗しました");
    }
  };

  const handleUpdateUser = async (values) => {
    try {
      await adminApi.updateUser(selectedUser.id, values);
      message.success("ユーザー情報を更新しました");
      setEditModalVisible(false);
      setSelectedUser(null);
      form.resetFields();
      loadUsers();
    } catch (error) {
      message.error("ユーザー情報の更新に失敗しました");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await adminApi.toggleUserStatus(userId);
      message.success(
        currentStatus === "active"
          ? "ユーザーを無効化しました"
          : "ユーザーを有効化しました"
      );
      loadUsers();
    } catch (error) {
      message.error("ステータスの更新に失敗しました");
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    try {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      const seconds = String(d.getSeconds()).padStart(2, "0");
      return `${year}年${month}月${day}日 ${hours}:${minutes}:${seconds}`;
    } catch (e) {
      return "";
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: "2%",
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "名前",
      dataIndex: "full_name",
      key: "name",
      width: "15%",
      render: (fullName, record) => (
        <div>
          <div style={{ fontWeight: "500" }}>{fullName}</div>
          <div style={{ fontSize: "12px", color: "#999" }}>
            @{record.username}
          </div>
        </div>
      ),
    },
    {
      title: "メール",
      dataIndex: "email",
      key: "email",
      width: "20%",
    },
    {
      title: "役割",
      dataIndex: "role",
      key: "role",
      width: "10%",
      render: (role) => (
        <Tag color={role === "admin" ? "red" : "blue"}>
          {role === "admin" ? "管理者" : "教師"}
        </Tag>
      ),
      filters: [
        { text: "管理者", value: "admin" },
        { text: "教師", value: "teacher" },
      ],
      onFilter: (value, record) => record.role === value,
    },
    {
      title: "参加日",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "12%",
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "ステータス",
      dataIndex: "status",
      key: "status",
      width: "10%",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "有効" : "無効"}
        </Tag>
      ),
      filters: [
        { text: "有効", value: "active" },
        { text: "無効", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "アクション",
      key: "actions",
      width: "15%",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewUser(record.id)}
          >
            表示
          </Button>
          <Button
            type="link"
            icon={
              record.status === "active" ? (
                <StopOutlined />
              ) : (
                <CheckCircleOutlined />
              )
            }
            onClick={() => handleToggleStatus(record.id, record.status)}
            danger={record.status === "active"}
          >
            {record.status === "active" ? "無効化" : "有効化"}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout selectedKey="members" title="メンバー管理">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Filter Section */}
        <Card
          style={{
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Space size="middle" wrap>
            <div>
              <span style={{ marginRight: "8px" }}>役割:</span>
              <Select
                style={{ width: 150 }}
                placeholder="すべて"
                allowClear
                value={filters.role}
                onChange={(value) => handleFilterChange("role", value)}
              >
                <Option value="admin">管理者</Option>
                <Option value="teacher">教師</Option>
              </Select>
            </div>
            <div>
              <span style={{ marginRight: "8px" }}>ステータス:</span>
              <Select
                style={{ width: 150 }}
                placeholder="すべて"
                allowClear
                value={filters.status}
                onChange={(value) => handleFilterChange("status", value)}
              >
                <Option value="active">有効</Option>
                <Option value="inactive">無効</Option>
              </Select>
            </div>
            <Input.Search
              placeholder="名前、メール、ユーザー名で検索"
              style={{ width: 300 }}
              allowClear
              onSearch={(value) => handleFilterChange("search", value)}
              enterButton={<SearchOutlined />}
            />
          </Space>
        </Card>

        {/* Users Table */}
        <Card
          style={{
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <Table
            columns={columns}
            dataSource={users}
            rowKey="id"
            loading={loading}
            pagination={{
              current: pagination.current,
              pageSize: pagination.pageSize,
              total: pagination.total,
              showSizeChanger: true,
              showTotal: (total) => `合計 ${total} 件`,
            }}
            onChange={handleTableChange}
          />
        </Card>
      </div>

      {/* View User Modal */}
      <Modal
        title="ユーザー詳細"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedUser(null);
        }}
        footer={[
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setViewModalVisible(false);
              handleEditUser(selectedUser.id);
            }}
          >
            編集
          </Button>,
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            閉じる
          </Button>,
        ]}
        width={600}
      >
        {selectedUser && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <strong>ID:</strong> {selectedUser.id}
            </div>
            <div>
              <strong>名前:</strong> {selectedUser.full_name}
            </div>
            <div>
              <strong>ユーザー名:</strong> @{selectedUser.username}
            </div>
            <div>
              <strong>メール:</strong> {selectedUser.email}
            </div>
            <div>
              <strong>役割:</strong>{" "}
              <Tag color={selectedUser.role === "admin" ? "red" : "blue"}>
                {selectedUser.role === "admin" ? "管理者" : "教師"}
              </Tag>
            </div>
            <div>
              <strong>ステータス:</strong>{" "}
              <Tag color={selectedUser.status === "active" ? "green" : "red"}>
                {selectedUser.status === "active" ? "有効" : "無効"}
              </Tag>
            </div>
            {selectedUser.department && (
              <div>
                <strong>部門:</strong> {selectedUser.department.name}
              </div>
            )}
            <div>
              <strong>参加日:</strong> {formatDate(selectedUser.createdAt)}
            </div>
            {selectedUser.bio && (
              <div>
                <strong>自己紹介:</strong>
                <div style={{ marginTop: "4px" }}>{selectedUser.bio}</div>
              </div>
            )}
            {selectedUser.current_job && (
              <div>
                <strong>現在の職務:</strong> {selectedUser.current_job}
              </div>
            )}
            {selectedUser.specialization && (
              <div>
                <strong>専門分野:</strong> {selectedUser.specialization}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="ユーザー編集"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedUser(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateUser}
          style={{ marginTop: "24px" }}
        >
          <Form.Item
            name="first_name"
            label="名"
            rules={[{ required: true, message: "名を入力してください" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="last_name"
            label="姓"
            rules={[{ required: true, message: "姓を入力してください" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="メール"
            rules={[
              { required: true, message: "メールを入力してください" },
              {
                type: "email",
                message: "有効なメールアドレスを入力してください",
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="role"
            label="役割"
            rules={[{ required: true, message: "役割を選択してください" }]}
          >
            <Select>
              <Option value="teacher">教師</Option>
              <Option value="admin">管理者</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="ステータス"
            rules={[
              { required: true, message: "ステータスを選択してください" },
            ]}
          >
            <Select>
              <Option value="active">有効</Option>
              <Option value="inactive">無効</Option>
            </Select>
          </Form.Item>

          <Form.Item name="bio" label="自己紹介">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="current_job" label="現在の職務">
            <Input />
          </Form.Item>

          <Form.Item name="work_experience" label="職務経験">
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item name="specialization" label="専門分野">
            <Input />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                更新
              </Button>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  setSelectedUser(null);
                  form.resetFields();
                }}
              >
                キャンセル
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AdminLayout>
  );
}

export default Members;
