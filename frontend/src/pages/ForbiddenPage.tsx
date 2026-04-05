import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ForbiddenPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Result
      status="403"
      title="403"
      subTitle={t('forbidden.message') || "Sorry, you don't have permission to access this page."}
      extra={
        <Button type="primary" onClick={() => navigate(-1)}>
          {t('forbidden.return') || 'Return to Previous Page'}
        </Button>
      }
    />
  );
}
