import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import App from './App';
import './index.css';

// 应用入口文件
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* 配置Ant Design为中文 */}
    <ConfigProvider locale={zhCN}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);
