import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Login.css'; // 引入样式文件

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      await login(values.username, values.password);
      navigate('/');
    } catch (error) {
      // 登录失败的错误提示在AuthContext里已经处理了
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <div className="login-card-wrapper">
          <Card className="login-card" title={<div className="login-title">欢迎登录</div>}>
            <Form
              name="login"
              onFinish={onFinish}
              autoComplete="off"
              layout="vertical"
              size="large"
            >
              <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined className="input-icon" />}
                  placeholder="请输入用户名"
                />
              </Form.Item>

              <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="input-icon" />}
                  placeholder="请输入密码"
                />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" block className="login-button">
                  登录
                </Button>
              </Form.Item>

              <Form.Item style={{ marginBottom: 0, textAlign: 'center' }}>
                <Link to="/register" className="register-link">
                  还没有账号？立即注册
                </Link>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
