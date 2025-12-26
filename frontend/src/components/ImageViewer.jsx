import React, { useState } from "react";
import { Modal, Button, message } from "antd";
import {
  LeftOutlined,
  RightOutlined,
  CloseOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

function ImageViewer({ visible, images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      handlePrevious();
    } else if (e.key === "ArrowRight") {
      handleNext();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  const handleDownload = (imageUrl) => {
    if (!imageUrl) {
      message.error("画像URLがありません");
      return;
    }

    const downloadUrl = `http://localhost:3000${imageUrl}`;

    // Extract filename from URL or use default
    const urlParts = imageUrl.split("/");
    const fileName =
      urlParts[urlParts.length - 1] || `image-${currentIndex + 1}.jpg`;

    // Use fetch with blob to force download (same as Documents.jsx for PDF)
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
  };

  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [visible, initialIndex]);

  if (!images || images.length === 0) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90vw"
      style={{ top: 20, maxWidth: "1200px" }}
      bodyStyle={{
        padding: 0,
        backgroundColor: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "80vh",
        position: "relative",
      }}
      closeIcon={<CloseOutlined style={{ color: "#fff", fontSize: "24px" }} />}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Previous Button */}
        {images.length > 1 && (
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={handlePrevious}
            style={{
              position: "absolute",
              left: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              color: "#fff",
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        )}

        {/* Image */}
        <img
          src={`http://localhost:3000${images[currentIndex]}`}
          alt={`Image ${currentIndex + 1}`}
          style={{
            maxWidth: "100%",
            maxHeight: "80vh",
            objectFit: "contain",
          }}
        />

        {/* Next Button */}
        {images.length > 1 && (
          <Button
            type="text"
            icon={<RightOutlined />}
            onClick={handleNext}
            style={{
              position: "absolute",
              right: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              backgroundColor: "rgba(255, 255, 255, 0.3)",
              color: "#fff",
              fontSize: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          />
        )}

        {/* Download Button */}
        <Button
          type="text"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(images[currentIndex])}
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            zIndex: 10,
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            color: "#fff",
            fontSize: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="ダウンロード"
        />

        {/* Image Counter */}
        {images.length > 1 && (
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "14px",
            }}
          >
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </Modal>
  );
}

export default ImageViewer;
