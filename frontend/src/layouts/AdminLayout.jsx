import React from "react";
import { Layout } from "antd";
import AdminSider from "../components/AdminSider";
import AppHeader from "../components/AppHeader";

const { Content } = Layout;

function AdminLayout({ children, selectedKey = "dashboard", title = "" }) {
  return (
    <Layout
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f7fb",
      }}
    >
      <AdminSider selectedKey={selectedKey} />

      <Layout
        style={{
          marginLeft: "240px",
          backgroundColor: "#f5f7fb",
        }}
      >
        <AppHeader title={title} />

        <Content
          className="p-2"
          style={{ backgroundColor: "#f5f7fb", padding: "20px 40px" }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminLayout;
