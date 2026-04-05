import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

export default function RegisterPage() {
  const { t } = useTranslation();
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
          <p style={{ color: '#666' }}>{t('register.createAccount') || 'Create your account'}</p>
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
              { required: true, message: t('register.enterName') || 'Please input your name' },
              { min: 2, message: t('register.nameMin') || 'Name must be at least 2 characters' },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('register.fullName') || 'Full Name'}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('register.enterEmail') || 'Please input your email' },
              { type: 'email', message: t('register.validEmail') || 'Please input a valid email' },
            ]}
          >
            <Input
              prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('common.email')}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="phone"
          >
            <Input
              prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('register.phoneOptional') || 'Phone (optional)'}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: t('register.enterPassword') || 'Please input your password' },
              { min: 8, message: t('register.passwordMin') || 'Password must be at least 8 characters' },
              { pattern: /[A-Z]/, message: t('register.passwordUpper') || 'Password must contain an uppercase letter' },
              { pattern: /[a-z]/, message: t('register.passwordLower') || 'Password must contain a lowercase letter' },
              { pattern: /[0-9]/, message: t('register.passwordNumber') || 'Password must contain a number' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('register.passwordHint') || 'Password (min 8 chars, 1 upper, 1 lower, 1 number)'}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: t('register.confirmPassword') || 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('register.passwordMismatch') || 'Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('register.confirmPassword') || 'Confirm Password'}
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              {t('common.register')}
            </Button>
          </Form.Item>
          <Divider plain style={{ margin: '16px 0', fontSize: 12 }}>
            {t('register.hasAccount') || 'Already have an account?'}
          </Divider>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button block size="large">
              <Link to="/login">{t('common.login')}</Link>
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
