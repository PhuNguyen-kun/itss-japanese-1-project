import React, { useState, useEffect } from "react";
import { Modal, Input, Button, message, Select, Upload } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { storyApi, topicApi } from "../api";

const { TextArea } = Input;

function EditStoryModal({ visible, story, onClose, onSuccess }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [topicId, setTopicId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  useEffect(() => {
    if (visible && story) {
      loadTopics();
      // Load story data
      setTitle(story.title || "");
      setContent(story.content || "");
      setTopicId(story.topic_id || null);
      
      // Load existing images
      const images = story.image_urls || (story.image_url ? [story.image_url] : []);
      setExistingImages(images);
      setImageFiles([]);
      setImagePreviews([]);
    }
  }, [visible, story]);

  const loadTopics = async () => {
    setLoadingTopics(true);
    try {
      const response = await topicApi.getAll();
      setTopics(response.data || []);
    } catch (error) {
      message.error("トピックの読み込みに失敗しました");
    } finally {
      setLoadingTopics(false);
    }
  };

  const handleImageChange = (file, fileList) => {
    // Validate file type
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      message.error("画像ファイルのみアップロードできます");
      return false;
    }

    // Validate file size (5MB)
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error("画像サイズは5MB以下である必要があります");
      return false;
    }

    // Limit to 10 images total (existing + new)
    if (existingImages.length + imageFiles.length >= 10) {
      message.warning("最大10枚の画像をアップロードできます");
      return false;
    }

    // Add to files array
    const newFiles = [...imageFiles, file];
    setImageFiles(newFiles);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreviews((prev) => [...prev, e.target.result]);
    };
    reader.readAsDataURL(file);

    return false; // Prevent auto upload
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      message.warning("タイトルと内容を入力してください");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      if (topicId) {
        formData.append("topic_id", topicId);
      }
      // Append existing images as JSON
      formData.append("image_urls", JSON.stringify(existingImages));
      // Append new images
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });

      await storyApi.update(story.id, formData);

      // Reset form
      setTitle("");
      setContent("");
      setTopicId(null);
      setImageFiles([]);
      setImagePreviews([]);
      setExistingImages([]);

      if (onSuccess) onSuccess();
    } catch (error) {
      message.error("ストーリーの更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setTopicId(null);
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    onClose();
  };

  const allImages = [
    ...existingImages.map((url) => ({ type: "existing", url })),
    ...imagePreviews.map((preview, index) => ({ type: "new", preview, index })),
  ];

  return (
    <Modal
      title="ストーリーを編集"
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          キャンセル
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          style={{
            backgroundColor: "#ff6767",
            borderColor: "#ff6767",
          }}
        >
          更新
        </Button>,
      ]}
      width={650}
      bodyStyle={{ backgroundColor: "#ffffff" }}
    >
      <div className="space-y-5">
        {/* Title Field */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            タイトル <span className="text-red-500">*</span>
          </label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="ストーリーのタイトルを入力"
            maxLength={255}
            size="large"
            style={{
              borderRadius: "8px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)",
            }}
          />
        </div>

        {/* Topic Dropdown */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            トピック
          </label>
          <Select
            value={topicId}
            onChange={setTopicId}
            placeholder="トピックを選択"
            loading={loadingTopics}
            allowClear
            size="large"
            style={{ width: "100%" }}
            className="rounded-lg"
          >
            {topics.map((topic) => (
              <Select.Option key={topic.id} value={topic.id}>
                {topic.name}
              </Select.Option>
            ))}
          </Select>
        </div>

        {/* Content Field */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            内容 <span className="text-red-500">*</span>
          </label>
          <TextArea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="アクティビティの説明をここに記入します..."
            rows={6}
            showCount
            maxLength={5000}
            style={{
              borderRadius: "8px",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.08)",
            }}
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-2 font-medium text-gray-700">
            画像（任意、最大10枚）
          </label>
          {allImages.length === 0 ? (
            <Upload.Dragger
              beforeUpload={handleImageChange}
              showUploadList={false}
              accept="image/*"
              multiple={true}
              style={{
                borderRadius: "8px",
                background: "white",
              }}
            >
              <p className="ant-upload-drag-icon">
                <PlusOutlined style={{ fontSize: 32, color: "#ff6767" }} />
              </p>
              <p className="ant-upload-text">
                クリックまたはドラッグして画像をアップロード
              </p>
              <p className="ant-upload-hint" style={{ color: "#999" }}>
                JPEG、PNG、GIF、WebP（最大5MB、最大10枚）
              </p>
            </Upload.Dragger>
          ) : (
            <div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                  gap: "12px",
                  marginBottom: "12px",
                }}
              >
                {allImages.map((item, index) => (
                  <div key={index} className="relative">
                    <img
                      src={
                        item.type === "existing"
                          ? `http://localhost:3000${item.url}`
                          : item.preview
                      }
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                    <Button
                      type="primary"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        if (item.type === "existing") {
                          handleRemoveExistingImage(
                            existingImages.findIndex((url) => url === item.url)
                          );
                        } else {
                          handleRemoveNewImage(item.index);
                        }
                      }}
                      size="small"
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                      }}
                    />
                  </div>
                ))}
              </div>
              {allImages.length < 10 && (
                <Upload.Dragger
                  beforeUpload={handleImageChange}
                  showUploadList={false}
                  accept="image/*"
                  multiple={true}
                  style={{
                    borderRadius: "8px",
                    background: "white",
                  }}
                >
                  <p className="ant-upload-drag-icon">
                    <PlusOutlined style={{ fontSize: 24, color: "#ff6767" }} />
                  </p>
                  <p className="ant-upload-text" style={{ fontSize: "14px" }}>
                    さらに画像を追加
                  </p>
                </Upload.Dragger>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default EditStoryModal;

