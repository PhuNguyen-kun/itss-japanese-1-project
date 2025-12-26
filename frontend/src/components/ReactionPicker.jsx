import React, { useState, useRef, useEffect } from "react";
import {
  LikeOutlined,
  HeartOutlined,
  SmileOutlined,
  CheckCircleOutlined,
  FrownOutlined,
} from "@ant-design/icons";

const reactions = [
  {
    type: "like",
    icon: <LikeOutlined />,
    label: "いいね",
    emoji: "👍",
    color: "#1890ff",
  },
  {
    type: "love",
    icon: <HeartOutlined />,
    label: "愛",
    emoji: "❤️",
    color: "#eb2f96",
  },
  {
    type: "haha",
    icon: <SmileOutlined />,
    label: "ははは",
    emoji: "😂",
    color: "#faad14",
  },
  {
    type: "support",
    icon: <CheckCircleOutlined />,
    label: "サポート",
    emoji: "💪",
    color: "#52c41a",
  },
  {
    type: "sad",
    icon: <FrownOutlined />,
    label: "悲しい",
    emoji: "😢",
    color: "#722ed1",
  },
];

function ReactionPicker({ onSelect, currentReaction }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const pickerRef = useRef(null);

  const handleReactionClick = (reactionType) => {
    if (onSelect) {
      onSelect(reactionType);
    }
  };

  return (
    <div
      ref={pickerRef}
      className="reaction-picker"
      style={{
        position: "absolute",
        bottom: "100%",
        left: 0,
        marginBottom: "8px",
        backgroundColor: "white",
        borderRadius: "24px",
        padding: "4px",
        boxShadow: "0 2px 16px rgba(0, 0, 0, 0.15)",
        display: "flex",
        gap: "4px",
        zIndex: 1000,
        animation: "slideUp 0.2s ease-out",
        pointerEvents: "auto",
      }}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .reaction-item {
          transition: transform 0.2s ease-out;
        }
        .reaction-item:hover {
          transform: scale(1.3) translateY(-4px);
        }
      `}</style>
      {reactions.map((reaction, index) => (
        <div
          key={reaction.type}
          className="reaction-item"
          style={{
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            fontSize: "24px",
            transform:
              hoveredIndex === index
                ? "scale(1.4) translateY(-4px)"
                : "scale(1)",
            transition: "all 0.2s ease-out",
          }}
          onMouseEnter={() => setHoveredIndex(index)}
          onClick={() => handleReactionClick(reaction.type)}
          title={reaction.label}
        >
          <span style={{ fontSize: "24px" }}>{reaction.emoji}</span>
        </div>
      ))}
    </div>
  );
}

export default ReactionPicker;
