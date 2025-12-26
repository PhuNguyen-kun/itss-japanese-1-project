import React, { useState, useEffect } from "react";
import { Modal, Input, Button, message, Select, Upload } from "antd";
import { UploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { documentApi } from "../api";

const { TextArea } = Input;

function UploadDocumentModal({ visible, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [file, setFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock categories - replace with actual API call if you have categories endpoint
  useEffect(() => {
    if (visible) {
      // TODO: Load categories from API
      setCategories([
        { id: 1, name: "教育方法" },
        { id: 2, name: "授業資料" },
        { id: 3, name: "試験問題" },
        { id: 4, name: "その他" },
      ]);
    }
  }, [visible]);

  const handleFileChange = (uploadFile) => {
    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ];

    if (!allowedTypes.includes(uploadFile.type)) {
      message.error(
        "PDF、Word、Excel、PowerPointファイルのみアップロードできます"
      );
      return false;
    }

    // Validate file size (10MB)
    const isLt10M = uploadFile.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error("ファイルサイズは10MB以下である必要があります");
      return false;
    }

    setFile(uploadFile);
    return false; // Prevent auto upload
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      message.error("タイトルを入力してください");
      return;
    }

    if (!file) {
      message.error("ファイルを選択してください");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      if (categoryId) {
        formData.append("category_id", categoryId);
      }
      formData.append("file", file);

      await documentApi.upload(formData);
      message.success("ドキュメントがアップロードされました");
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      message.error(
        error.response?.data?.message ||
          "ドキュメントのアップロードに失敗しました"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCategoryId(null);
    setFile(null);
    onClose();
  };

  return (
    <Modal
      title="ドキュメントをアップロード"
      open={visible}
      onCancel={handleClose}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          キャンセル
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          style={{ backgroundColor: "#5158b6" }}
        >
          アップロード
        </Button>,
      ]}
      width={600}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Title */}
        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>
            タイトル <span style={{ color: "red" }}>*</span>
          </label>
          <Input
            placeholder="ドキュメントのタイトルを入力"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
          />
        </div>

        {/* Description */}
        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>説明</label>
          <TextArea
            placeholder="ドキュメントの説明を入力（任意）"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        </div>

        {/* Category */}
        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>
            カテゴリー
          </label>
          <Select
            placeholder="カテゴリーを選択"
            value={categoryId}
            onChange={setCategoryId}
            style={{ width: "100%" }}
            allowClear
          >
            {categories.map((cat) => (
              <Select.Option key={cat.id} value={cat.id}>
                {cat.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* File Upload */}
        <div>
          <label style={{ display: "block", marginBottom: "8px" }}>
            ファイル <span style={{ color: "red" }}>*</span>
          </label>
          {!file ? (
            <Upload.Dragger
              beforeUpload={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              showUploadList={false}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">
                クリックまたはドラッグしてファイルをアップロード
              </p>
              <p className="ant-upload-hint">
                PDF、Word、Excel、PowerPoint (最大10MB)
              </p>
            </Upload.Dragger>
          ) : (
            <div
              style={{
                border: "1px solid #d9d9d9",
                borderRadius: "8px",
                padding: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <div style={{ fontWeight: "500" }}>{file.name}</div>
                <div style={{ fontSize: "12px", color: "#888" }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={handleRemoveFile}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default UploadDocumentModal;
