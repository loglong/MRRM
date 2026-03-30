import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: { email: string; password: string; name: string; phone?: string }) => {
    setLoading(true);
    try {
      await register(values.email, values.password, values.name, values.phone);
      navigate('/dashboard');
    } catch {
      // Error handled in context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1E5F8A 0%, #2E7D5A 100%)',
      }}
    >
      <Card style={{ width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 600, color: '#1E5F8A', marginBottom: 8 }}>
            MRRM
          </h1>
          <p style={{ color: '#666' }}>Create your account</p>
        </div>
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Please input your name' },
              { min: 2, message: 'Name must be at least 2 characters' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Full Name"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email' },
              { type: 'email', message: 'Please input a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="phone"
          >
            <Input
              prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Phone (optional)"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password' },
              { min: 8, message: 'Password must be at least 8 characters' },
              { pattern: /[A-Z]/, message: 'Password must contain an uppercase letter' },
              { pattern: /[a-z]/, message: 'Password must contain a lowercase letter' },
              { pattern: /[0-9]/, message: 'Password must contain a number' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Password (min 8 chars, 1 upper, 1 lower, 1 number)"
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="Confirm Password"
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              Register
            </Button>
          </Form.Item>
          <Divider plain style={{ margin: '16px 0', fontSize: 12 }}>
            Already have an account?
          </Divider>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button block size="large">
              <Link to="/login">Login</Link>
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
