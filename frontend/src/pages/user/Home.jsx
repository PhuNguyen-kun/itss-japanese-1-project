// src/pages/Home.jsx
import React from "react";
import { Card, Typography, Avatar, Space, Tag } from "antd";
import DefaultLayout from "../../layouts/LayoutDefault";

const { Title, Text } = Typography;

function Home() {
  const activities = [
    {
      id: 1,
      teacher: "先生C",
      time: "2時間前に投稿",
      title: "ABCドキュメント",
      type: "PDF",
      description: "",
    },
    {
      id: 2,
      teacher: "先生A",
      time: "20時間前に投稿",
      title: "",
      type: "",
      description: "アクティビティの説明文をここに記載します…",
    },
    {
      id: 3,
      teacher: "先生B",
      time: "昨日投稿",
      title: "",
      type: "",
      description: "アクティビティの説明文をここに記載します…",
    },
  ];

  return (
    <DefaultLayout selectedKey="home" title="ホーム">
      <div className="mx-auto px-4 space-y-4">
        <Card className="rounded-2xl shadow-sm border-0">
          <Title level={3} className="!mb-0 text-red-500">
            おかえり！
          </Title>
        </Card>

        {activities.map((item) => (
          <Card
            key={item.id}
            className="rounded-2xl shadow-sm border border-gray-200"
            style={{ padding: "16px 20px" }}
          >
            <Space align="start" size="middle" className="w-full">
              <Avatar size={40} style={{ backgroundColor: "#e5e7eb" }} />

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <Text strong>{item.teacher}</Text>
                  <Text type="secondary" className="text-xs">
                    {item.time}
                  </Text>
                </div>

                {item.title && (
                  <div className="flex items-center gap-3 mt-1">
                    <Text className="text-sm">{item.title}</Text>
                    {item.type && <Tag color="red">{item.type}</Tag>}
                  </div>
                )}

                {item.description && (
                  <Text type="secondary" className="text-sm">
                    {item.description}
                  </Text>
                )}
              </div>
            </Space>
          </Card>
        ))}
      </div>
    </DefaultLayout>
  );
}

export default Home;
