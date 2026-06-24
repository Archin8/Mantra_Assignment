import React, { useState } from 'react';
import { Layout, Tabs } from 'antd';
import {
  DashboardOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import DashboardView from './views/DashboardView';
import GrantAssistantView from './views/GrantAssistantView';

const { Header, Content } = Layout;

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <div className="logo">
          <div className="logo-icon">M4</div>
          <div>
            <div className="logo-text">Mantra4Change</div>
            <div className="logo-subtitle">PBL Program Intelligence</div>
          </div>
        </div>
      </Header>

      <Content className="app-content">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          size="large"
          items={[
            {
              key: 'dashboard',
              label: (
                <span>
                  <DashboardOutlined /> Program Review
                </span>
              ),
              children: <DashboardView />,
            },
            {
              key: 'grants',
              label: (
                <span>
                  <FileTextOutlined /> Grant Assistant
                </span>
              ),
              children: <GrantAssistantView />,
            },
          ]}
        />
      </Content>
    </Layout>
  );
};

export default App;
