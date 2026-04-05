import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Checkbox, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSSOLogin = () => {
    window.location.href = '/api/v1/auth/authing/sso-url';
  };

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      await login(values.email, values.password, rememberMe);
      navigate('/dashboard');
    } catch (error: any) {
      if (error?.response?.data?.lockedUntil) {
        const lockedUntil = new Date(error.response.data.lockedUntil);
        message.error(t('auth.accountLocked', { time: lockedUntil.toLocaleTimeString() }));
      } else {
        message.error(t('auth.loginFailed'));
      }
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
            {t('auth.loginTitle')}
          </h1>
          <p style={{ color: '#666' }}>{t('auth.loginSubtitle')}</p>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          requiredMark={false}
          initialValues={{ email: 'admin@mrrm.local', password: 'admin123' }}
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: t('auth.invalidCredentials') },
              { type: 'email', message: t('auth.invalidCredentials') },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('common.email')}
              size="large"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: t('common.password') + ' is required' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder={t('common.password')}
              size="large"
            />
          </Form.Item>
          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <Checkbox checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}>
                {t('common.rememberMe')}
              </Checkbox>
              <Link to="/forgot-password" style={{ fontSize: 14 }}>
                {t('common.forgotPassword')}
              </Link>
            </div>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block size="large">
              {t('common.login')}
            </Button>
          </Form.Item>
          <Divider plain style={{ margin: '16px 0', fontSize: 12 }}>
            {t('common.orContinueWith')}
          </Divider>
          <Form.Item>
            <Button
              icon={<GoogleOutlined />}
              onClick={handleSSOLogin}
              block
              size="large"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {t('common.ssoLogin')}
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <span style={{ color: '#666' }}>{t('common.noAccount')} </span>
          <Link to="/register">{t('common.register')}</Link>
        </div>
      </Card>
    </div>
  );
}
