import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Checkbox, Divider, message } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

// Apple Design Colors
const APPLE_BLUE = '#0071e3';
const APPLE_LIGHT_BG = '#f5f5f7';
const APPLE_NEAR_BLACK = '#1d1d1f';
const APPLE_TEXT_SECONDARY = 'rgba(0, 0, 0, 0.65)';
const APPLE_TEXT_TERTIARY = 'rgba(0, 0, 0, 0.48)';

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
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', Helvetica, Arial, sans-serif",
      }}
    >
      {/* Left Side - Branding (Apple style) */}
      <div
        style={{
          flex: 1,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: `linear-gradient(135deg, ${APPLE_BLUE} 0%, #5856d6 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 32,
          }}
        >
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 32 }}>M</span>
        </div>

        {/* Brand Name */}
        <h1
          style={{
            fontSize: 40,
            fontWeight: 600,
            color: '#ffffff',
            margin: 0,
            letterSpacing: -0.5,
            lineHeight: 1.1,
          }}
        >
          {t('auth.loginSubtitle') || 'MRRM'}
        </h1>
        <p
          style={{
            fontSize: 17,
            color: 'rgba(255, 255, 255, 0.65)',
            marginTop: 12,
            letterSpacing: -0.374,
          }}
        >
          Medical Patient Relationship Management
        </p>

        {/* Features */}
        <div style={{ marginTop: 64, maxWidth: 320 }}>
          <FeatureItem text="智能患者管理" />
          <FeatureItem text="精准需求追踪" />
          <FeatureItem text="自动化随访提醒" />
          <FeatureItem text="数据驱动决策" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div
        style={{
          flex: 1,
          background: APPLE_LIGHT_BG,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 48,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 380,
          }}
        >
          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <h2
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: APPLE_NEAR_BLACK,
                margin: '0 0 8px 0',
                letterSpacing: -0.5,
                lineHeight: 1.14,
              }}
            >
              {t('auth.loginTitle') || '欢迎回来'}
            </h2>
            <p
              style={{
                fontSize: 17,
                color: APPLE_TEXT_SECONDARY,
                margin: 0,
                letterSpacing: -0.374,
              }}
            >
              登录您的账户以继续
            </p>
          </div>

          {/* Form */}
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
              style={{ marginBottom: 20 }}
            >
              <Input
                prefix={<UserOutlined style={{ color: APPLE_TEXT_TERTIARY }} />}
                placeholder={t('common.email') || '邮箱'}
                size="large"
                style={{
                  borderRadius: 8,
                  height: 48,
                  fontSize: 17,
                }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: t('common.password') + ' is required' }]}
              style={{ marginBottom: 16 }}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: APPLE_TEXT_TERTIARY }} />}
                placeholder={t('common.password') || '密码'}
                size="large"
                style={{
                  borderRadius: 8,
                  height: 48,
                  fontSize: 17,
                }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ fontSize: 15 }}
                >
                  <span style={{ color: APPLE_TEXT_SECONDARY, fontSize: 15 }}>记住我</span>
                </Checkbox>
                <Link
                  to="/forgot-password"
                  style={{
                    fontSize: 15,
                    color: APPLE_BLUE,
                    textDecoration: 'none',
                    letterSpacing: -0.24,
                  }}
                >
                  忘记密码?
                </Link>
              </div>
            </Form.Item>

            <Form.Item style={{ marginBottom: 24 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  background: APPLE_BLUE,
                  borderColor: APPLE_BLUE,
                  borderRadius: 8,
                  height: 48,
                  fontSize: 17,
                  fontWeight: 500,
                }}
              >
                {t('common.login') || '登录'}
              </Button>
            </Form.Item>

            <Divider
              plain
              style={{
                margin: '24px 0',
                fontSize: 13,
                color: APPLE_TEXT_TERTIARY,
                letterSpacing: -0.24,
              }}
            >
              或
            </Divider>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                icon={<GoogleOutlined />}
                onClick={handleSSOLogin}
                block
                size="large"
                style={{
                  height: 48,
                  borderRadius: 8,
                  fontSize: 17,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {t('common.ssoLogin') || '使用 Google 登录'}
              </Button>
            </Form.Item>
          </Form>

          {/* Register Link */}
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <span
              style={{
                fontSize: 15,
                color: APPLE_TEXT_SECONDARY,
                letterSpacing: -0.24,
              }}
            >
              {t('common.noAccount')} {'  '}
            </span>
            <Link
              to="/register"
              style={{
                fontSize: 15,
                color: APPLE_BLUE,
                fontWeight: 500,
                textDecoration: 'none',
                letterSpacing: -0.24,
              }}
            >
              {t('common.register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
      }}
    >
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: APPLE_BLUE,
        }}
      />
      <span
        style={{
          fontSize: 17,
          color: 'rgba(255, 255, 255, 0.8)',
          letterSpacing: -0.374,
        }}
      >
        {text}
      </span>
    </div>
  );
}
