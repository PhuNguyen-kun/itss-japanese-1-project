import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Table,
  Spin,
  message,
  Typography,
  Tag,
  Button,
  List,
  Avatar,
  Modal,
  Space,
} from "antd";
import {
  DeleteOutlined,
  EyeOutlined,
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  FolderOutlined,
} from "@ant-design/icons";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, getElementAtEvent } from "react-chartjs-2";
import AdminLayout from "../../layouts/AdminLayout";
import { adminApi, storyApi } from "../../api";
import CommentModal from "../../components/CommentModal";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const { Title: AntTitle, Text } = Typography;

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [activityTrend, setActivityTrend] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [storiesByDate, setStoriesByDate] = useState([]);
  const [loadingStories, setLoadingStories] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [storiesModalVisible, setStoriesModalVisible] = useState(false);
  const chartRef = useRef();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, trendRes, activitiesRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getActivityTrend(),
        adminApi.getRecentActivities(5),
      ]);

      setStats(statsRes.data);
      setActivityTrend(trendRes.data || []);
      setRecentActivities(activitiesRes.data || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      message.error("ダッシュボードデータの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  // Format time ago in Japanese
  const formatTimeAgo = (date) => {
    if (!date) return "";
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now - activityDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins}分前`;
    } else if (diffHours < 24) {
      return `${diffHours}時間前`;
    } else {
      return `${diffDays}日前`;
    }
  };

  // Format date in Japanese format
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}年${month}月${day}日`;
  };

  // Handle chart click
  const handleChartClick = (event) => {
    const { current: chart } = chartRef;
    if (!chart) return;

    const element = getElementAtEvent(chart, event);
    if (element.length === 0) return;

    const index = element[0].index;
    const selectedTrendItem = activityTrend[index];
    if (selectedTrendItem && selectedTrendItem.count > 0) {
      loadStoriesByDate(selectedTrendItem.date);
    }
  };

  // Load stories by date
  const loadStoriesByDate = async (date) => {
    setSelectedDate(date);
    setLoadingStories(true);
    try {
      const response = await adminApi.getStoriesByDate(date);
      setStoriesByDate(response.data || []);
      setStoriesModalVisible(true);
    } catch (error) {
      console.error("Failed to load stories:", error);
      message.error("ストーリーの読み込みに失敗しました");
    } finally {
      setLoadingStories(false);
    }
  };

  // Handle delete story
  const handleDeleteStory = async (storyId, e) => {
    e.stopPropagation(); // Prevent opening comment modal
    Modal.confirm({
      title: "ストーリーを削除しますか？",
      content: "この操作は取り消せません。",
      okText: "削除",
      okType: "danger",
      cancelText: "キャンセル",
      onOk: async () => {
        try {
          await adminApi.deleteStory(storyId);
          message.success("ストーリーを削除しました");
          // Reload stories list
          if (selectedDate) {
            const response = await adminApi.getStoriesByDate(selectedDate);
            setStoriesByDate(response.data || []);
          }
        } catch (error) {
          message.error("ストーリーの削除に失敗しました");
        }
      },
    });
  };

  // Handle story click
  const handleStoryClick = async (storyId) => {
    try {
      const response = await storyApi.getById(storyId);
      setSelectedStory(response.data);
      setModalVisible(true);
    } catch (error) {
      message.error("ストーリーの読み込みに失敗しました");
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedStory(null);
  };

  // Prepare chart data
  const chartData = {
    labels: activityTrend.map((item) => {
      const date = new Date(item.date);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    }),
    datasets: [
      {
        label: "ストーリー投稿数",
        data: activityTrend.map((item) => item.count),
        borderColor: "rgba(255, 103, 103, 1)",
        backgroundColor: "rgba(255, 103, 103, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
        pointBackgroundColor: "rgba(255, 103, 103, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        padding: 12,
        titleFont: {
          size: 14,
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
  };

  // Table columns for recent activities
  const columns = [
    {
      title: "アクティビティタイプ",
      dataIndex: "type",
      key: "type",
      width: "20%",
    },
    {
      title: "ユーザー",
      dataIndex: "user",
      key: "user",
      width: "15%",
    },
    {
      title: "詳細",
      dataIndex: "details",
      key: "details",
      width: "35%",
      ellipsis: true,
    },
    {
      title: "時刻",
      dataIndex: "time",
      key: "time",
      width: "15%",
      render: (time) => formatTimeAgo(time),
    },
    {
      title: "ステータス",
      dataIndex: "status",
      key: "status",
      width: "15%",
      render: (status, record) => (
        <Tag color={record.status_color}>{status}</Tag>
      ),
    },
  ];

  if (loading) {
    return (
      <AdminLayout selectedKey="dashboard">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "400px",
          }}
        >
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout selectedKey="dashboard" title="管理者ダッシュボード">
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Key Metrics Cards */}
        <div>
          <AntTitle level={4} style={{ marginBottom: "16px" }}>
            主要メトリクス
          </AntTitle>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "16px",
            }}
          >
            <Card
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              <UserOutlined
                style={{
                  fontSize: "32px",
                  color: "#1890ff",
                  marginBottom: "12px",
                }}
              />
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#1890ff",
                }}
              >
                {stats?.total_teachers || 0}
              </div>
              <div
                style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}
              >
                総教師数
              </div>
            </Card>
            <Card
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              <TeamOutlined
                style={{
                  fontSize: "32px",
                  color: "#52c41a",
                  marginBottom: "12px",
                }}
              />
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#52c41a",
                }}
              >
                {stats?.active_this_month || 0}
              </div>
              <div
                style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}
              >
                今月活動中
              </div>
            </Card>
            <Card
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              <FileTextOutlined
                style={{
                  fontSize: "32px",
                  color: "#ff6767",
                  marginBottom: "12px",
                }}
              />
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#ff6767",
                }}
              >
                {stats?.total_stories?.toLocaleString() || 0}
              </div>
              <div
                style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}
              >
                総ストーリー数
              </div>
            </Card>
            <Card
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                textAlign: "center",
              }}
            >
              <FolderOutlined
                style={{
                  fontSize: "32px",
                  color: "#fa8c16",
                  marginBottom: "12px",
                }}
              />
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: "700",
                  color: "#fa8c16",
                }}
              >
                {stats?.total_documents || 0}
              </div>
              <div
                style={{ marginTop: "8px", fontSize: "14px", color: "#666" }}
              >
                共有ドキュメント
              </div>
            </Card>
          </div>
        </div>

        {/* Activity Trend Chart */}
        <div>
          <AntTitle level={4} style={{ marginBottom: "16px" }}>
            アクティビティ傾向 (過去30日間)
          </AntTitle>
          <Card
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              minHeight: "300px",
            }}
          >
            <div
              style={{ height: "300px", cursor: "pointer" }}
              onClick={handleChartClick}
            >
              <Line ref={chartRef} data={chartData} options={chartOptions} />
            </div>
            <Text
              type="secondary"
              style={{ fontSize: "12px", marginTop: "16px", display: "block" }}
            >
              アクティビティチャート -
              時系列で投稿されたストーリー（ポイントをクリックしてストーリー一覧を表示）
            </Text>
          </Card>
        </div>

        {/* Recent Activities Table */}
        <div>
          <AntTitle level={4} style={{ marginBottom: "16px" }}>
            最近のアクティビティ
          </AntTitle>
          <Card
            style={{
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Table
              columns={columns}
              dataSource={recentActivities}
              rowKey="id"
              pagination={false}
              size="middle"
            />
          </Card>
        </div>
      </div>

      {/* Stories List Modal */}
      <Modal
        title={
          <div style={{ textAlign: "left" }}>
            <AntTitle level={4} style={{ margin: 0, textAlign: "left" }}>
              {selectedDate
                ? `${formatDate(selectedDate)}のストーリー`
                : "ストーリー一覧"}{" "}
              ({storiesByDate.length}件)
            </AntTitle>
          </div>
        }
        open={storiesModalVisible}
        onCancel={() => {
          setStoriesModalVisible(false);
          setSelectedDate(null);
          setStoriesByDate([]);
        }}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Spin spinning={loadingStories}>
          <List
            dataSource={storiesByDate}
            locale={{ emptyText: "この日のストーリーはありません" }}
            renderItem={(story) => (
              <List.Item
                style={{
                  padding: "16px",
                  borderBottom: "1px solid #f0f0f0",
                }}
              >
                <div style={{ width: "100%", textAlign: "left" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        flex: 1,
                      }}
                    >
                      <Avatar
                        src={
                          story.author?.avatar_url
                            ? `http://localhost:3000${story.author.avatar_url}`
                            : null
                        }
                        icon={
                          !story.author?.avatar_url &&
                          story.author && (
                            <span>
                              {story.author.username?.[0] ||
                                story.author.first_name?.[0] ||
                                "U"}
                            </span>
                          )
                        }
                      />
                      <div style={{ textAlign: "left" }}>
                        <Text
                          strong
                          style={{ display: "block", textAlign: "left" }}
                        >
                          {story.title}
                        </Text>
                        <div style={{ marginTop: "4px", textAlign: "left" }}>
                          <Text
                            type="secondary"
                            style={{ fontSize: "12px", textAlign: "left" }}
                          >
                            {story.author?.username ||
                              `${story.author?.first_name || ""} ${
                                story.author?.last_name || ""
                              }`.trim()}
                          </Text>
                          {story.topic && (
                            <>
                              <Text
                                type="secondary"
                                style={{ margin: "0 8px" }}
                              >
                                •
                              </Text>
                              <Tag color="blue" style={{ fontSize: "12px" }}>
                                {story.topic.name}
                              </Tag>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <Space>
                      <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={() => handleStoryClick(story.id)}
                      >
                        表示
                      </Button>
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={(e) => handleDeleteStory(story.id, e)}
                      >
                        削除
                      </Button>
                    </Space>
                  </div>
                  <Text
                    ellipsis={{ rows: 2, expandable: false }}
                    style={{
                      fontSize: "13px",
                      textAlign: "left",
                      display: "block",
                      marginTop: "8px",
                    }}
                  >
                    {story.content}
                  </Text>
                  <div
                    style={{
                      display: "flex",
                      gap: "16px",
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "8px",
                      textAlign: "left",
                    }}
                  >
                    <span>👍 {story.reactions_count || 0}</span>
                    <span>💬 {story.comment_count || 0}</span>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Spin>
      </Modal>

      {/* Comment Modal */}
      <CommentModal
        visible={modalVisible}
        story={selectedStory}
        onClose={handleModalClose}
        onUpdate={() => {
          // Reload stories if date is selected
          if (selectedDate) {
            loadStoriesByDate(selectedDate);
          }
        }}
      />
    </AdminLayout>
  );
}

export default Dashboard;
