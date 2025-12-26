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
  Switch,
} from "antd";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PushpinOutlined,
  SearchOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import AdminLayout from "../../layouts/AdminLayout";
import { adminApi } from "../../api";

const { Title: AntTitle } = Typography;
const { Option } = Select;
const { TextArea } = Input;

function Topics() {
  const [topics, setTopics] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
  });
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
    loadTopics();
  }, [pagination.current, filters]);

  const loadCategories = async () => {
    try {
      const response = await adminApi.getCategories();
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  const loadTopics = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        per_page: pagination.pageSize,
        ...filters,
      };
      const response = await adminApi.getTopics(params);
      setTopics(response.data.topics || []);
      setPagination({
        ...pagination,
        total: response.data.pagination?.total || 0,
      });
    } catch (error) {
      console.error("Failed to load topics:", error);
      message.error("トピックリストの読み込みに失敗しました");
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

  const handleViewTopic = async (topicId) => {
    try {
      const response = await adminApi.getTopicById(topicId);
      setSelectedTopic(response.data);
      setViewModalVisible(true);
    } catch (error) {
      message.error("トピック情報の取得に失敗しました");
    }
  };

  const handleEditTopic = async (topicId) => {
    try {
      const response = await adminApi.getTopicById(topicId);
      setSelectedTopic(response.data);
      form.setFieldsValue({
        name: response.data.name,
        description: response.data.description,
        category_id: response.data.category_id,
        is_pinned: response.data.is_pinned,
      });
      setEditModalVisible(true);
    } catch (error) {
      message.error("トピック情報の取得に失敗しました");
    }
  };

  const handleCreateTopic = () => {
    form.resetFields();
    setSelectedTopic(null);
    setCreateModalVisible(true);
  };

  const handleSubmitCreate = async (values) => {
    try {
      await adminApi.createTopic(values);
      message.success("トピックを作成しました");
      setCreateModalVisible(false);
      form.resetFields();
      loadTopics();
    } catch (error) {
      message.error("トピックの作成に失敗しました");
    }
  };

  const handleSubmitUpdate = async (values) => {
    try {
      await adminApi.updateTopic(selectedTopic.id, values);
      message.success("トピックを更新しました");
      setEditModalVisible(false);
      setSelectedTopic(null);
      form.resetFields();
      loadTopics();
    } catch (error) {
      message.error("トピックの更新に失敗しました");
    }
  };

  const handleDeleteTopic = async (topicId) => {
    Modal.confirm({
      title: "トピックを削除しますか？",
      content: "この操作は取り消せません。",
      okText: "削除",
      okType: "danger",
      cancelText: "キャンセル",
      onOk: async () => {
        try {
          await adminApi.deleteTopic(topicId);
          message.success("トピックを削除しました");
          loadTopics();
        } catch (error) {
          message.error("トピックの削除に失敗しました");
        }
      },
    });
  };

  const handleTogglePin = async (topicId, currentPinned) => {
    try {
      await adminApi.togglePinTopic(topicId);
      message.success(
        currentPinned ? "トピックのピン留めを解除しました" : "トピックをピン留めしました"
      );
      loadTopics();
    } catch (error) {
      message.error("操作に失敗しました");
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
      title: "トピック名",
      dataIndex: "name",
      key: "name",
      width: "20%",
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}>
            {record.is_pinned && <PushpinOutlined style={{ color: "#ff4d4f" }} />}
            {name}
          </div>
        </div>
      ),
    },
    {
      title: "説明",
      dataIndex: "description",
      key: "description",
      width: "30%",
      render: (description) => (
        <div style={{ maxWidth: "400px", overflow: "hidden", textOverflow: "ellipsis" }}>
          {description || "-"}
        </div>
      ),
    },
    {
      title: "カテゴリー",
      dataIndex: "category",
      key: "category",
      width: "12%",
      render: (category) => (category ? category.name : "-"),
    },
    {
      title: "ストーリー数",
      dataIndex: "story_count",
      key: "story_count",
      width: "8%",
      align: "center",
      sorter: (a, b) => a.story_count - b.story_count,
    },
    {
      title: "コメント数",
      dataIndex: "comment_count",
      key: "comment_count",
      width: "8%",
      align: "center",
      sorter: (a, b) => a.comment_count - b.comment_count,
    },
    {
      title: "作成日",
      dataIndex: "createdAt",
      key: "createdAt",
      width: "12%",
      render: (date) => formatDate(date),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "アクション",
      key: "actions",
      width: "20%",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewTopic(record.id)}
          >
            表示
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEditTopic(record.id)}
          >
            編集
          </Button>
          <Button
            type="link"
            icon={<PushpinOutlined />}
            onClick={() => handleTogglePin(record.id, record.is_pinned)}
            danger={record.is_pinned}
          >
            {record.is_pinned ? "ピン解除" : "ピン留め"}
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteTopic(record.id)}
          >
            削除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout selectedKey="topics" title="トピック管理">
      <Card
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        {/* Header Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <AntTitle level={4} style={{ margin: 0 }}>
            既存のトピック
          </AntTitle>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreateTopic}
          >
            トピック作成
          </Button>
        </div>

        {/* Search Section */}
        <div style={{ marginBottom: "16px", display: "flex", justifyContent: "flex-start" }}>
          <Input.Search
            placeholder="トピック名、説明で検索"
            style={{ width: 300 }}
            allowClear
            onSearch={(value) => handleFilterChange("search", value)}
            enterButton={<SearchOutlined />}
          />
        </div>

        {/* Topics Table */}
        <Table
          columns={columns}
          dataSource={topics}
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

      {/* Create Topic Modal */}
      <Modal
        title="トピック作成"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitCreate}
          style={{ marginTop: "24px" }}
        >
          <Form.Item
            name="name"
            label="トピック名"
            rules={[{ required: true, message: "トピック名を入力してください" }]}
          >
            <Input placeholder="例：学生の集中力向上" />
          </Form.Item>

          <Form.Item
            name="description"
            label="説明"
            rules={[{ required: true, message: "説明を入力してください" }]}
          >
            <TextArea rows={4} placeholder="トピックの目的やディスカッションの焦点を記入" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="カテゴリー"
            rules={[{ required: true, message: "カテゴリーを選択してください" }]}
          >
            <Select placeholder="カテゴリーを選択">
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="is_pinned" label="ピン留め" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                作成
              </Button>
              <Button
                onClick={() => {
                  setCreateModalVisible(false);
                  form.resetFields();
                }}
              >
                キャンセル
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* View Topic Modal */}
      <Modal
        title="トピック詳細"
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setSelectedTopic(null);
        }}
        footer={[
          <Button
            key="edit"
            type="primary"
            onClick={() => {
              setViewModalVisible(false);
              handleEditTopic(selectedTopic.id);
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
        {selectedTopic && (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div>
              <strong>ID:</strong> {selectedTopic.id}
            </div>
            <div>
              <strong>トピック名:</strong> {selectedTopic.name}
              {selectedTopic.is_pinned && (
                <Tag color="red" style={{ marginLeft: "8px" }}>
                  <PushpinOutlined /> ピン留め
                </Tag>
              )}
            </div>
            <div>
              <strong>説明:</strong>
              <div style={{ marginTop: "4px" }}>{selectedTopic.description || "-"}</div>
            </div>
            <div>
              <strong>カテゴリー:</strong> {selectedTopic.category?.name || "-"}
            </div>
            <div>
              <strong>ストーリー数:</strong> {selectedTopic.story_count || 0}
            </div>
            <div>
              <strong>コメント数:</strong> {selectedTopic.comment_count || 0}
            </div>
            <div>
              <strong>作成者:</strong>{" "}
              {selectedTopic.creator
                ? `${selectedTopic.creator.first_name} ${selectedTopic.creator.last_name}`
                : "-"}
            </div>
            <div>
              <strong>作成日:</strong> {formatDate(selectedTopic.createdAt)}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Topic Modal */}
      <Modal
        title="トピック編集"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedTopic(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmitUpdate}
          style={{ marginTop: "24px" }}
        >
          <Form.Item
            name="name"
            label="トピック名"
            rules={[{ required: true, message: "トピック名を入力してください" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="説明"
            rules={[{ required: true, message: "説明を入力してください" }]}
          >
            <TextArea rows={4} />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="カテゴリー"
            rules={[{ required: true, message: "カテゴリーを選択してください" }]}
          >
            <Select>
              {categories.map((cat) => (
                <Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="is_pinned" label="ピン留め" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                更新
              </Button>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  setSelectedTopic(null);
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

export default Topics;

