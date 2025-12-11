"use client";

import Link from "next/link";
import { Alert, Button, Card, Space, Typography, theme } from "antd";
import { useTranslation } from "react-i18next";
import { GamePlayer } from "@/components/GamePlayer";
import { useAppState } from "@/components/AppLayout";

export default function GamePage() {
  const { selectedFile, language } = useAppState();
  const { t } = useTranslation();
  const { token } = theme.useToken();

  if (!selectedFile) {
    return (
      <Card
        style={{
          background: token.colorBgContainer,
          borderColor: token.colorBorder,
        }}
      >
        <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            {t("gameNeedFileTitle")}
          </Typography.Title>
          <Typography.Paragraph style={{ margin: 0, color: token.colorTextSecondary }}>
            {t("gameNeedFileDesc")}
          </Typography.Paragraph>
          <Link href="/upload" style={{ width: "fit-content" }}>
            <Button type="primary">{t("backToUpload")}</Button>
          </Link>
        </Space>
      </Card>
    );
  }

  return (
    <Space orientation="vertical" size="large" style={{ width: "100%" }}>
      <GamePlayer file={selectedFile} language={language} />
      <Typography.Title level={2} style={{ margin: 0 }}>
        {selectedFile.name}
      </Typography.Title>
      <Typography.Paragraph style={{ marginTop: -4, color: token.colorTextSecondary }}>
        {t("gameHintChange")}
      </Typography.Paragraph>
      <Alert
        showIcon
        type="info"
        title={
          <Space size="middle">
            <span>{t("statusReadyForGame")}</span>
            <Link href="/upload">
              <Button size="small">{t("gameReplaceRom")}</Button>
            </Link>
          </Space>
        }
        style={{
          background: token.colorBgElevated,
          borderColor: token.colorBorder,
          color: token.colorText,
        }}
      />
    </Space>
  );
}

