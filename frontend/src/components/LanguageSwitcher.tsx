import { Dropdown, Button } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = ({ key }: { key: string }) => {
    i18n.changeLanguage(key);
  };

  const menuItems = [
    {
      key: 'zh',
      label: '中文',
    },
    {
      key: 'en',
      label: 'English',
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleLanguageChange }}
      placement="bottomRight"
    >
      <Button type="text" icon={<GlobalOutlined />} style={{ fontSize: 18 }}>
        {i18n.language === 'zh' ? '中文' : 'EN'}
      </Button>
    </Dropdown>
  );
}
