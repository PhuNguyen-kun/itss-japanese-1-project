import React, { useState, useEffect } from "react";
import { Card, Avatar, Typography, Space, Button, Tag, message } from "antd";
import {
  DownloadOutlined,
  FileOutlined,
  EyeOutlined,
  HeartOutlined,
  HeartFilled,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { documentApi } from "../api";

// Date formatting helper - Japanese format: 2025年12月25日 16:20:57
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


function DocumentCard({ document, onCommentClick, onReactionClick }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [savedCount, setSavedCount] = useState(document.saved_count || 0);

  useEffect(() => {
    checkIfSaved();
    // Update saved count from document prop
    if (document.saved_count !== undefined) {
      setSavedCount(document.saved_count);
    }
  }, [document.id, document.saved_count]);

  const checkIfSaved = async () => {
    try {
      // Check if document is saved by getting saved documents
      const response = await documentApi.getSaved({ limit: 1000 });
      const savedIds = (response.data || []).map((doc) => doc.id);
      setIsSaved(savedIds.includes(document.id));
    } catch (error) {
      console.error("Failed to check saved status:", error);
    }
  };

  const getAuthorName = () => {
    if (document.uploader) {
      return document.uploader.username || `${document.uploader.first_name} ${document.uploader.last_name}`;
    }
    return "Unknown";
  };

  const getTimeAgo = () => {
    return formatJapaneseDateTime(document.created_at || document.createdAt);
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

    // For PDF, force download instead of opening in new tab
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
      // Other file types: normal download
      const link = window.document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
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

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await documentApi.unsave(document.id);
        setIsSaved(false);
        setSavedCount((prev) => Math.max(0, prev - 1));
        message.success("保存を解除しました");
      } else {
        await documentApi.save(document.id);
        setIsSaved(true);
        setSavedCount((prev) => prev + 1);
        message.success("ドキュメントを保存しました");
      }
    } catch (error) {
      message.error("操作に失敗しました");
    }
  };

  return (
    <Card
      className="rounded-2xl shadow-sm border border-gray-200 mb-4"
      style={{ padding: "20px", marginBottom: "16px" }}
    >
      <Space align="start" size="middle" className="w-full">
        <Avatar
          size={48}
          src={
            document.uploader?.avatar_url
              ? `http://localhost:3000${document.uploader.avatar_url}`
              : null
          }
          icon={!document.uploader?.avatar_url && <span>{getAuthorName()[0]}</span>}
          style={{
            backgroundColor: "#e5e7eb",
            flexShrink: 0,
            cursor: "pointer",
          }}
          onClick={() => {
            const uploaderId = document.uploader?.id || document.user_id;
            if (uploaderId) {
              navigate(`/profile/${uploaderId}`);
            }
          }}
        />

        <div className="flex-1" style={{ minWidth: 0, textAlign: "left" }}>
          <div className="mt-2 mb-3" style={{ textAlign: "left" }}>
            <Text
              strong
              style={{
                fontSize: 18,
                display: "block",
                textAlign: "left",
                cursor: "pointer",
              }}
              onClick={() => {
                const uploaderId = document.uploader?.id || document.user_id;
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
              style={{ fontSize: 14, display: "block", marginTop: 4, textAlign: "left" }}
            >
              {getTimeAgo()}
            </Text>
            {/* Category Tag */}
            {document.category && (
              <div style={{ marginTop: 8, textAlign: "left" }}>
                <Tag color="green" style={{ fontSize: "12px" }}>
                  {document.category.name}
                </Tag>
              </div>
            )}
          </div>

          {/* Document Title */}
          <div className="flex items-center gap-2 mb-2" style={{ textAlign: "left", justifyContent: "flex-start" }}>
            {getFileIcon(document.file_type)}
            <Text strong style={{ fontSize: 16, textAlign: "left" }}>
              {document.title}
            </Text>
          </div>

          {/* Document Description */}
          {document.description && (
            <Paragraph
              style={{
                marginBottom: 16,
                fontSize: 14,
                color: "#374151",
                whiteSpace: "pre-wrap",
                textAlign: "left",
              }}
            >
              {document.description}
            </Paragraph>
          )}

          {/* File Info */}
          <div className="mb-3" style={{ textAlign: "left" }}>
            <Tag color="blue">{document.file_type?.toUpperCase()}</Tag>
            <Text type="secondary" style={{ fontSize: 12, marginLeft: 8, textAlign: "left" }}>
              {document.file_name}
            </Text>
          </div>


          {/* Action Buttons - 3 actions: Eye, Download, Heart */}
          <div className="flex items-center gap-2 mt-3">
            <Space size="small">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleView(document.file_url, document.file_type)}
                title={
                  document.file_type?.toLowerCase() === "pdf"
                    ? "表示"
                    : "プレビュー不可"
                }
                disabled={document.file_type?.toLowerCase() !== "pdf"}
                style={{
                  border: "none",
                  outline: "none",
                  boxShadow: "none",
                  color:
                    document.file_type?.toLowerCase() === "pdf"
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
                    document.file_url,
                    document.file_name,
                    document.file_type
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
      </Space>
    </Card>
  );
}

export default DocumentCard;

