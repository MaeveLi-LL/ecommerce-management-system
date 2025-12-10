import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import './Dashboard.css'; // 引入样式文件

const { Header, Sider, Content } = Layout;

const Dashboard = () => {
  // 从 localStorage 读取保存的侧边栏宽度，默认 200px
  const defaultWidth = parseInt(localStorage.getItem('siderWidth') || '200', 10);
  const [collapsed, setCollapsed] = useState(false);
  const [siderWidth, setSiderWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const siderRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // 根据当前页面路径，高亮对应的菜单项
  const getSelectedKey = () => {
    if (location.pathname.includes('/products')) return '1';
    if (location.pathname.includes('/categories')) return '2';
    return '1';
  };

  // 处理鼠标按下，开始拖拽
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // 处理鼠标移动，调整侧边栏宽度
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      // 限制最小宽度 150px，最大宽度 400px
      if (newWidth >= 150 && newWidth <= 400) {
        setSiderWidth(newWidth);
        localStorage.setItem('siderWidth', newWidth.toString());
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
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
      label: 'Product Management',
      onClick: () => navigate('/products'),
    },
    {
      key: '2',
      icon: <AppstoreOutlined />,
      label: 'Category Management',
      onClick: () => navigate('/categories'),
    },
  ];

  return (
    <Layout className="dashboard-layout">
      <div 
        ref={siderRef}
        style={{ 
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: collapsed ? 80 : siderWidth,
          height: '100vh',
          transition: isResizing ? 'none' : 'width 0.2s',
          zIndex: 100,
        }}
      >
        <Sider 
          trigger={null} 
          collapsible 
          collapsed={collapsed}
          width={siderWidth}
          className="dashboard-sider"
          style={{
            height: '100vh',
            overflow: 'visible',
          }}
        >
          <div className="logo-container">
            <div className="logo-text">
              {collapsed ? 'E-Commerce' : 'E-Commerce Management'}
            </div>
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[getSelectedKey()]}
            items={menuItems}
            className="dashboard-menu"
            style={{
              background: 'linear-gradient(180deg, #667eea 0%, #764ba2 100%)',
              height: 'calc(100vh - 96px)',
              overflowY: 'auto',
            }}
          />
        </Sider>
        {/* 拖拽调整条 - 只支持左右拖动 */}
        {!collapsed && (
          <div
            className="sider-resizer"
            onMouseDown={handleMouseDown}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '4px',
              height: '100%',
              cursor: 'col-resize',
              zIndex: 10,
              backgroundColor: 'transparent',
            }}
          />
        )}
      </div>
      <Layout style={{ marginLeft: collapsed ? 80 : siderWidth, transition: isResizing ? 'none' : 'margin-left 0.2s' }}>
        <Header className="dashboard-header">
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            className="collapse-button"
          />
          <Space className="user-info">
            <span className="welcome-text">Welcome, {user?.username}</span>
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
