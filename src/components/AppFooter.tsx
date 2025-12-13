// Client component
"use client";

import { Layout, Typography } from "antd";
import { useTranslation } from "react-i18next";

interface AppFooterProps {
  colors: {
    textSecondary: string;
    border: string;
    background: string;
  };
}

export function AppFooter({ colors }: AppFooterProps) {
  const { t } = useTranslation();

  return (
    <Layout.Footer
      style={{
        textAlign: "center",
        background: colors.background,
        borderTop: `1px solid ${colors.border}`,
        padding: "24px 16px",
        color: colors.textSecondary,
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <Typography.Text
          style={{
            fontSize: "12px",
            color: colors.textSecondary,
            lineHeight: "1.6",
          }}
        >
          {t("footerDisclaimer")}
        </Typography.Text>
      </div>
    </Layout.Footer>
  );
}

