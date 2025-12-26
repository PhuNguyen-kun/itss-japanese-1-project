import React from "react";
import { Layout } from "antd";
import AppSider from "../components/AppSider";
import AppHeader from "../components/AppHeader";

const { Content } = Layout;

function DefaultLayout({ children, selectedKey = "home", title = "" }) {
  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f5f7fb" }}>
      <AppSider selectedKey={selectedKey} />

      <Layout style={{ marginLeft: "240px", backgroundColor: "#f5f7fb" }}>
        <AppHeader title={title} />

        <Content className="p-2" style={{ backgroundColor: "#f5f7fb" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}

export default DefaultLayout;
