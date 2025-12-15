import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import App from './App';
import './index.css';

// 应用入口文件
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Configure Ant Design locale */}
    <ConfigProvider locale={enUS}>
      <App />
    </ConfigProvider>
  </React.StrictMode>,
);
