import React, { useState, useEffect } from "react";
import {
  Modal,
  Avatar,
  Typography,
  Space,
  Button,
  Tag,
  Dropdown,
  message,
  Modal as ConfirmModal,
} from "antd";
import {
  DownloadOutlined,
  FileOutlined,
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
  EllipsisOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { documentApi } from "../api";

const formatJapaneseDateTime = (date) => {
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

const { Text, Paragraph } = Typography;

function DocumentModal({ visible, document, onClose, onUpdate, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(document?.saved_count || 0);
  const [documentData, setDocumentData] = useState(document);

  useEffect(() => {
    if (visible && document) {
      setDocumentData(document);
      // Update saved count from document data
      if (document.saved_count !== undefined && document.saved_count !== null) {
        setSavedCount(document.saved_count);
      }
      checkIfSaved();
    }
  }, [visible, document]);

  // Update saved count when documentData changes
  useEffect(() => {
    if (documentData?.saved_count !== undefined && documentData?.saved_count !== null) {
      setSavedCount(documentData.saved_count);
    }
  }, [documentData?.saved_count]);

  const checkIfSaved = async () => {
    if (!document?.id) return;
    try {
      const response = await documentApi.getSaved({ limit: 100, page: 1 });

      let savedDocs = [];
      if (Array.isArray(response.data)) {
        savedDocs = response.data;
      } else if (response.data?.documents) {
        savedDocs = response.data.documents;
      }

      const savedIds = savedDocs.map((doc) => doc.id);
      setIsSaved(savedIds.includes(document.id));
    } catch (error) {
      console.error("Failed to check saved status:", error);
    }
  };

  const getAuthorName = () => {
    if (documentData?.uploader) {
      return (
        documentData.uploader.username ||
        `${documentData.uploader.first_name} ${documentData.uploader.last_name}`
      );
    }
    return "Unknown";
  };

  const getTimeAgo = () => {
    return formatJapaneseDateTime(
      documentData?.created_at || documentData?.createdAt
    );
  };

  const getFileIcon = (fileType) => {
    const lowerType = fileType?.toLowerCase();
    if (lowerType === "pdf") {
      return <FileOutlined style={{ fontSize: "24px", color: "#ff4d4f" }} />;
    } else if (lowerType === "doc" || lowerType === "docx") {
      return <FileOutlined style={{ fontSize: "24px", color: "#1890ff" }} />;
    } else if (lowerType === "xls" || lowerType === "xlsx") {
      return <FileOutlined style={{ fontSize: "24px", color: "#52c41a" }} />;
    }
    return <FileOutlined style={{ fontSize: "24px" }} />;
  };

  const handleDownload = (fileUrl, fileName, fileType) => {
    const downloadUrl = documentApi.download(fileUrl);

    if (fileType?.toLowerCase() === "pdf") {
      fetch(downloadUrl)
        .then((response) => response.blob())
        .then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = window.document.createElement("a");
          link.href = url;
          link.download = fileName;
          window.document.body.appendChild(link);
          link.click();
          window.document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        })
        .catch((error) => {
          console.error("Download failed:", error);
          message.error("ダウンロードに失敗しました");
        });
    } else {
      const link = window.document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    }
  };

  const handleView = (fileUrl, fileType) => {
    if (fileType?.toLowerCase() === "pdf") {
      const viewUrl = documentApi.download(fileUrl);
      window.open(viewUrl, "_blank");
    } else {
      message.info(
        "このファイルタイプはブラウザで表示できません。ダウンロードしてください。"
      );
    }
  };

  const handleSaveToggle = async () => {
    if (!documentData?.id) return;
    try {
      if (isSaved) {
        await documentApi.unsave(documentData.id);
        setIsSaved(false);
        message.success("保存を解除しました");
      } else {
        await documentApi.save(documentData.id);
        setIsSaved(true);
        message.success("ドキュメントを保存しました");
      }
      
      // Reload document to get updated saved_count
      try {
        const response = await documentApi.getById(documentData.id);
        if (response.data) {
          setDocumentData(response.data);
          if (response.data.saved_count !== undefined && response.data.saved_count !== null) {
            setSavedCount(response.data.saved_count);
          }
        }
      } catch (error) {
        console.error("Failed to reload document:", error);
        // Fallback: update count manually
        if (isSaved) {
          setSavedCount((prev) => Math.max(0, prev - 1));
        } else {
          setSavedCount((prev) => prev + 1);
        }
      }
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      message.error("操作に失敗しました");
      setIsSaved((prev) => !prev);
    }
  };

  const handleDelete = () => {
    ConfirmModal.confirm({
      title: "ドキュメントを削除しますか？",
      content: "この操作は取り消せません。",
      okText: "削除",
      cancelText: "キャンセル",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await documentApi.delete(documentData.id);
          message.success("ドキュメントを削除しました");
          if (onDelete) {
            onDelete(documentData.id);
          }
          onClose();
        } catch (error) {
          message.error("削除に失敗しました");
        }
      },
    });
  };

  if (!documentData) return null;

  return (
    <Modal
      title="資料"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      style={{ top: 20 }}
      destroyOnClose={false}
      getContainer={() => document?.body || false}
      maskClosable={true}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          width: "100%",
        }}
      >
        <Avatar
          size={48}
          src={
            documentData.uploader?.avatar_url
              ? `http://localhost:3000${documentData.uploader.avatar_url}`
              : null
          }
          icon={
            !documentData.uploader?.avatar_url && (
              <span>{getAuthorName()[0]}</span>
            )
          }
          style={{
            backgroundColor: "#e5e7eb",
            flexShrink: 0,
            cursor: "pointer",
          }}
          onClick={() => {
            const uploaderId = documentData.uploader?.id || documentData.user_id;
            if (uploaderId) {
              navigate(`/profile/${uploaderId}`);
            }
          }}
        />

        <div
          style={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            textAlign: "left",
          }}
        >
          <div
            className="mt-2 mb-3"
            style={{
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
            }}
          >
            <div>
              <Text
                strong
                style={{
                  fontSize: 18,
                  display: "block",
                  textAlign: "left",
                  cursor: "pointer",
                }}
                onClick={() => {
                  const uploaderId =
                    documentData.uploader?.id || documentData.user_id;
                  if (uploaderId) {
                    navigate(`/profile/${uploaderId}`);
                  }
                }}
              >
                {getAuthorName()}
              </Text>
              <Text
                type="secondary"
                className="text-xs"
                style={{
                  fontSize: 14,
                  display: "block",
                  marginTop: 4,
                  textAlign: "left",
                }}
              >
                {getTimeAgo()}
              </Text>
              {documentData.category && (
                <div style={{ marginTop: 8, textAlign: "left" }}>
                  <Tag color="green" style={{ fontSize: "12px" }}>
                    {documentData.category.name}
                  </Tag>
                </div>
              )}
            </div>
            {(documentData.uploader?.id === user?.id ||
              documentData.user_id === user?.id) && (
              <Dropdown
                menu={{
                  items: [
                    {
                      key: "delete",
                      label: "削除",
                      icon: <DeleteOutlined />,
                      danger: true,
                      onClick: handleDelete,
                    },
                  ],
                }}
                trigger={["click"]}
                placement="bottomRight"
              >
                <Button
                  type="text"
                  icon={<EllipsisOutlined />}
                  style={{
                    color: "#666",
                    border: "none",
                    outline: "none",
                    boxShadow: "none",
                    fontSize: "20px",
                  }}
                />
              </Dropdown>
            )}
          </div>

          <div
            className="flex items-center gap-2 mb-2"
            style={{ textAlign: "left", justifyContent: "flex-start" }}
          >
            {getFileIcon(documentData.file_type)}
            <Text strong style={{ fontSize: 16, textAlign: "left" }}>
              {documentData.title}
            </Text>
          </div>

          {documentData.description && (
            <Paragraph
              style={{
                marginBottom: 16,
                fontSize: 14,
                color: "#374151",
                whiteSpace: "pre-wrap",
                textAlign: "left",
              }}
            >
              {documentData.description}
            </Paragraph>
          )}

          <div className="mb-3" style={{ textAlign: "left" }}>
            <Tag color="blue">{documentData.file_type?.toUpperCase()}</Tag>
            <Text
              type="secondary"
              style={{ fontSize: 12, marginLeft: 8, textAlign: "left" }}
            >
              {documentData.file_name}
            </Text>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <Space size="small">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() =>
                  handleView(documentData.file_url, documentData.file_type)
                }
                title={
                  documentData.file_type?.toLowerCase() === "pdf"
                    ? "表示"
                    : "プレビュー不可"
                }
                disabled={documentData.file_type?.toLowerCase() !== "pdf"}
                style={{
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  color:
                    documentData.file_type?.toLowerCase() === "pdf"
                      ? undefined
                      : "#d9d9d9",
                }}
              />

              <Button
                type="text"
                icon={<DownloadOutlined />}
                size="small"
                onClick={() =>
                  handleDownload(
                    documentData.file_url,
                    documentData.file_name,
                    documentData.file_type
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
                onClick={handleSaveToggle}
                title={isSaved ? "保存を解除" : "保存"}
                style={{
                  color: isSaved ? "#eb2f96" : undefined,
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                }}
              >
                {savedCount > 0 && (
                  <span style={{ marginLeft: 4 }}>{savedCount}</span>
                )}
              </Button>
            </Space>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default DocumentModal;

