import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Button,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Avatar,
  Tabs,
} from "antd";
import {
  UploadOutlined,
  DownloadOutlined,
  DeleteOutlined,
  FileOutlined,
  SearchOutlined,
  SaveOutlined,
  HeartOutlined,
  HeartFilled,
  EyeOutlined,
} from "@ant-design/icons";
import { documentApi } from "../../api";
import DefaultLayout from "../../layouts/LayoutDefault";
import UploadDocumentModal from "../../components/UploadDocumentModal";

const { Search } = Input;

function Documents() {
  const [allDocuments, setAllDocuments] = useState([]);
  const [myDocuments, setMyDocuments] = useState([]);
  const [savedDocuments, setSavedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [savedDocumentIds, setSavedDocumentIds] = useState(new Set());

  // Mock categories - replace with actual API
  const categories = [
    { id: 1, name: "教育方法" },
    { id: 2, name: "授業資料" },
    { id: 3, name: "試験問題" },
    { id: 4, name: "その他" },
  ];

  useEffect(() => {
    loadDocuments();
  }, [searchText, categoryFilter, activeTab]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const params = {
        search: searchText || undefined,
        category_id: categoryFilter || undefined,
      };

      if (activeTab === "all") {
        const response = await documentApi.getAll(params);
        console.log("All documents response:", response);
        setAllDocuments(response.data || []);
      } else if (activeTab === "my") {
        const response = await documentApi.getMy(params);
        console.log("My documents response:", response);
        setMyDocuments(response.data || []);
      } else if (activeTab === "saved") {
        const response = await documentApi.getSaved(params);
        console.log("Saved documents response:", response);
        setSavedDocuments(response.data || []);
        // Update savedDocumentIds from saved tab
        const savedIds = new Set(response.data.map((doc) => doc.id));
        setSavedDocumentIds(savedIds);
      }
    } catch (error) {
      console.error("Failed to load documents:", error);
      message.error("ドキュメントの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = () => {
    loadDocuments();
  };

  const handleDownload = (fileUrl, fileName, fileType) => {
    const downloadUrl = documentApi.download(fileUrl);

    // For PDF, force download instead of opening in new tab
    if (fileType?.toLowerCase() === "pdf") {
      fetch(downloadUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error("Download failed:", error);
          message.error("ダウンロードに失敗しました");
        });
    } else {
      // Other file types: normal download
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDelete = async (id) => {
    try {
      await documentApi.delete(id);
      message.success("ドキュメントが削除されました");
      loadDocuments();
    } catch (error) {
      message.error("ドキュメントの削除に失敗しました");
    }
  };

  const handleSaveToggle = async (document) => {
    try {
      const isSaved = savedDocumentIds.has(document.id);

      // Optimistic update
      setSavedDocumentIds((prev) => {
        const newSet = new Set(prev);
        if (isSaved) {
          newSet.delete(document.id);
        } else {
          newSet.add(document.id);
        }
        return newSet;
      });

      if (isSaved) {
        await documentApi.unsave(document.id);
        message.success("保存を解除しました");
      } else {
        await documentApi.save(document.id);
        message.success("ドキュメントを保存しました");
      }

      // Reload if on saved tab to update the list
      if (activeTab === "saved") {
        loadDocuments();
      }
    } catch (error) {
      message.error("操作に失敗しました");
      // Revert optimistic update on error
      setSavedDocumentIds((prev) => {
        const newSet = new Set(prev);
        if (savedDocumentIds.has(document.id)) {
          newSet.add(document.id);
        } else {
          newSet.delete(document.id);
        }
        return newSet;
      });
    }
  };

  const handleView = (fileUrl, fileType) => {
    // Only PDFs can be viewed in browser
    if (fileType?.toLowerCase() === "pdf") {
      const viewUrl = documentApi.download(fileUrl);
      window.open(viewUrl, "_blank");
    } else {
      message.info(
        "このファイルタイプはブラウザで表示できません。ダウンロードしてください。"
      );
    }
  };

  const getFileIcon = (fileType) => {
    const iconStyle = { fontSize: "24px" };
    const lowerType = fileType?.toLowerCase();

    if (lowerType === "pdf") {
      return <FileOutlined style={{ ...iconStyle, color: "#ff4d4f" }} />;
    } else if (lowerType === "doc" || lowerType === "docx") {
      return <FileOutlined style={{ ...iconStyle, color: "#1890ff" }} />;
    } else if (lowerType === "xls" || lowerType === "xlsx") {
      return <FileOutlined style={{ ...iconStyle, color: "#52c41a" }} />;
    } else if (lowerType === "ppt" || lowerType === "pptx") {
      return <FileOutlined style={{ ...iconStyle, color: "#fa8c16" }} />;
    }
    return <FileOutlined style={iconStyle} />;
  };

  const columns = [
    {
      title: "",
      dataIndex: "file_type",
      key: "icon",
      width: 60,
      render: (fileType) => getFileIcon(fileType),
    },
    {
      title: "ドキュメント名",
      dataIndex: "title",
      key: "title",
      width: "35%",
      render: (title, record) => {
        const maxLength = 100;
        const isExpanded = expandedDescriptions[record.id];
        const description = record.description || "";
        const shouldShowMore = description.length > maxLength;
        const displayDescription =
          isExpanded || !shouldShowMore
            ? description
            : description.substring(0, maxLength) + "...";

        return (
          <div style={{ maxWidth: "400px" }}>
            <div style={{ fontWeight: "500", marginBottom: "4px" }}>
              {title}
            </div>
            {record.description && (
              <div
                style={{
                  fontSize: "12px",
                  color: "#888",
                  wordWrap: "break-word",
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5",
                }}
              >
                {displayDescription}
                {shouldShowMore && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => {
                      setExpandedDescriptions((prev) => ({
                        ...prev,
                        [record.id]: !prev[record.id],
                      }));
                    }}
                    style={{
                      padding: "0 4px",
                      height: "auto",
                      fontSize: "12px",
                      color: "var(--theme-color)",
                      border: "none",
                      outline: "none",
                      boxShadow: "none",
                    }}
                  >
                    {isExpanded ? "隠す" : "もっと見る"}
                  </Button>
                )}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: "タイプ",
      dataIndex: "file_type",
      key: "file_type",
      width: "10%",
      render: (type) => (
        <span style={{ textTransform: "uppercase" }}>{type}</span>
      ),
    },
    {
      title: "アップロード者",
      dataIndex: ["uploader", "first_name"],
      key: "uploader",
      width: "15%",
      render: (firstName, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Avatar
            size="small"
            style={{ backgroundColor: "var(--theme-color)" }}
          >
            {firstName?.charAt(0)}
          </Avatar>
          <span>
            {firstName} {record.uploader?.last_name}
          </span>
        </div>
      ),
    },
    {
      title: "カテゴリー",
      dataIndex: ["category", "name"],
      key: "category",
      width: "12%",
      render: (name) => name || "-",
    },
    {
      title: "日付",
      dataIndex: "created_at",
      key: "created_at",
      width: "12%",
      render: (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("ja-JP");
      },
    },
    {
      title: "アクション",
      key: "actions",
      width: "15%",
      render: (_, record) => {
        const currentUserId = JSON.parse(
          localStorage.getItem("user") || "{}"
        ).id;
        const isOwner = record.uploader?.id === currentUserId;
        const isSaved = savedDocumentIds.has(record.id);
        const isPDF = record.file_type?.toLowerCase() === "pdf";

        return (
          <Space size="small">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handleView(record.file_url, record.file_type)}
              title={isPDF ? "表示" : "プレビュー不可"}
              disabled={!isPDF}
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
                color: isPDF ? undefined : "#d9d9d9",
              }}
            />

            <Button
              type="text"
              icon={<DownloadOutlined />}
              size="small"
              onClick={() =>
                handleDownload(
                  record.file_url,
                  record.file_name,
                  record.file_type
                )
              }
              title="ダウンロード"
              style={{
                border: "none",
                outline: "none",
                boxShadow: "none",
              }}
            />

            <Button
              type="text"
              icon={isSaved ? <HeartFilled /> : <HeartOutlined />}
              size="small"
              onClick={() => handleSaveToggle(record)}
              title={isSaved ? "保存を解除" : "保存"}
              style={{
                color: isSaved ? "var(--theme-color)" : undefined,
                border: "none",
                outline: "none",
                boxShadow: "none",
              }}
            />

            {isOwner && activeTab === "my" && (
              <Popconfirm
                title="このドキュメントを削除しますか？"
                onConfirm={() => handleDelete(record.id)}
                okText="はい"
                cancelText="いいえ"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  size="small"
                />
              </Popconfirm>
            )}
          </Space>
        );
      },
    },
  ];

  const tabItems = [
    {
      key: "all",
      label: "すべてのドキュメント",
      children: (
        <Table
          columns={columns}
          dataSource={allDocuments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `合計 ${total} 件`,
          }}
        />
      ),
    },
    {
      key: "my",
      label: "あなたが投稿する文書",
      children: (
        <Table
          columns={columns}
          dataSource={myDocuments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `合計 ${total} 件`,
          }}
        />
      ),
    },
    {
      key: "saved",
      label: "保存した文書",
      children: (
        <Table
          columns={columns}
          dataSource={savedDocuments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 20,
            showTotal: (total) => `合計 ${total} 件`,
          }}
        />
      ),
    },
  ];

  return (
    <DefaultLayout selectedKey="documents" title="文書">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <Card
          bordered={false}
          style={{
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {/* Header Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div style={{ display: "flex", gap: "12px", flex: 1 }}>
              <Search
                placeholder="ドキュメント名で検索"
                allowClear
                enterButton={<SearchOutlined />}
                style={{ maxWidth: "400px" }}
                onSearch={setSearchText}
              />
              <Select
                placeholder="カテゴリーで絞り込む"
                style={{ width: "250px" }}
                allowClear
                onChange={setCategoryFilter}
                value={categoryFilter}
              >
                {categories.map((cat) => (
                  <Select.Option key={cat.id} value={cat.id}>
                    {cat.name}
                  </Select.Option>
                ))}
              </Select>
            </div>

            <Button
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => setUploadModalVisible(true)}
              style={{ backgroundColor: "#5158b6" }}
              size="large"
            >
              ドキュメントをアップロード
            </Button>
          </div>

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
          />
        </Card>
      </div>

      <UploadDocumentModal
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onSuccess={handleUploadSuccess}
      />
    </DefaultLayout>
  );
}

export default Documents;
