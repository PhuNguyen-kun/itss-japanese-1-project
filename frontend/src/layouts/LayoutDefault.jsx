import React from "react";
import { Layout } from "antd";
import AppSider from "../components/AppSider";
import AppHeader from "../components/AppHeader";

const { Content } = Layout;

function DefaultLayout({ children, selectedKey = "home", title = "" }) {
  return (
    <Layout className="min-h-screen bg-[#f5f7fb]">
      <AppSider selectedKey={selectedKey} />

      <Layout style={{ marginLeft: "240px" }}>
        <AppHeader title={title} />

        <Content className="p-2">{children}</Content>
      </Layout>
    </Layout>
  );
}

export default DefaultLayout;
