import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './Dashboard.css'; // 引入样式文件

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前页面路径，高亮对应的菜单项
  const getSelectedKey = () => {
    if (location.pathname.includes('/products')) return '1';
    if (location.pathname.includes('/categories')) return '2';
    return '1';
  };

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  const menuItems = [
    {
      key: '1',
      icon: <ShoppingOutlined />,
      label: '商品管理',
      onClick: () => navigate('/products'),
    },
    {
      key: '2',
      icon: <AppstoreOutlined />,
      label: '分类管理',
      onClick: () => navigate('/categories'),
    },
  ];

  return (
    <Layout className="dashboard-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className="dashboard-sider"
      >
        <div className="logo-container">
          <div className="logo-text">
            {collapsed ? '电商' : '电商管理系统'}
          </div>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          className="dashboard-menu"
        />
      </Sider>
      <Layout>
        <Header className="dashboard-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="collapse-button"
          />
          <Space className="user-info">
            <span className="welcome-text">欢迎，{user?.username}</span>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar
                className="user-avatar"
                icon={<UserOutlined />}
              />
            </Dropdown>
          </Space>
        </Header>
        <Content className="dashboard-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
