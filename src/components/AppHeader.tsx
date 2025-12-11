// Client component
"use client";

import { Button, Dropdown, Layout, Space, Tooltip, Typography, Divider, Switch } from "antd";
import { TranslationOutlined, MoonFilled, SunFilled } from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useTranslation } from "react-i18next";

interface AppHeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  language: "zh" | "en";
  onLanguageChange: (lang: "zh" | "en") => void;
  colors: {
    textBase: string;
    border: string;
    background: string;
  };
}

export function AppHeader({
  isDark,
  onToggleTheme,
  onLanguageChange,
  colors,
}: AppHeaderProps) {
  const { t } = useTranslation();
  const langItems: MenuProps["items"] = [
    { key: "zh", label: t("langZh") },
    { key: "en", label: "English" },
  ];

  return (
    <Layout.Header
      style={{
        background: colors.background,
        borderBottom: `1px solid ${colors.border}`,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <Space align="center">
        <Typography.Title level={4} style={{ margin: 0, color: colors.textBase }}>
          EmulatorJS
        </Typography.Title>
      </Space>
      <Space>
        <Dropdown
          menu={{
            items: langItems,
            onClick: ({ key }) => onLanguageChange(key as "zh" | "en"),
          }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Button
            icon={<TranslationOutlined />}
            type="text"
            size="large"
            aria-label="Switch language"
            style={{ fontSize: 18, padding: 6 }}
          />
        </Dropdown>
        <Divider orientation="vertical" style={{ height: 24, margin: "0 6px" }} />
        <Tooltip title={isDark ? t("themeToLight") : t("themeToDark")}>
          <Switch
            checked={isDark}
            onChange={onToggleTheme}
            checkedChildren={<MoonFilled />}
            unCheckedChildren={<SunFilled />}
            aria-label="Toggle theme"
          />
        </Tooltip>
      </Space>
    </Layout.Header>
  );
}

