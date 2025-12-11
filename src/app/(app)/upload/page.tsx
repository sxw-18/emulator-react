"use client";

import { Alert, Button, Card, Space, Typography, Upload, theme } from "antd";
import type { UploadProps } from "antd";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { useAppState } from "@/components/AppLayout";

const ACCEPT =
  ".zip,.7z,.nes,.sfc,.smc,.gba,.gb,.gbc,.nds,.n64,.z64,.pce,.md,.gen,.smd,.iso,.bin,.img,.fds,.unif,.unf,.fig,.gd3,.gd7,.dx2,.bsx,.swc,.ngp,.ngc,.ws,.wsc,.col,.cv,.d64";

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const { setSelectedFile } = useAppState();
  const { t } = useTranslation();
  const router = useRouter();
  const { token } = theme.useToken();

  const [isDragging, setIsDragging] = useState(false);
  const [statusKey, setStatusKey] = useState<"idle" | "ready">("idle");

  const statusText = useMemo(
    () => (statusKey === "ready" ? t("statusReadyForGame") : t("statusIdle")),
    [statusKey, t]
  );

  const handleFile = useCallback(
    (file: File) => {
      setSelectedFile(file);
      setStatusKey("ready");
      router.push("/game");
    },
    [router, setSelectedFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const uploadProps = useMemo<UploadProps>(
    () => ({
      multiple: false,
      showUploadList: false,
      openFileDialogOnClick: false,
      accept: ACCEPT,
      beforeUpload: (file: File) => {
        handleFile(file);
        return false;
      },
      onDrop: (e: React.DragEvent<HTMLElement>) => {
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
      },
      onDragOver: () => setIsDragging(true),
      onDragLeave: () => setIsDragging(false),
    }),
    [handleFile]
  );

  return (
    <Space orientation="vertical" size="large" style={{ width: "100%" }}>
      <Typography.Title level={2} style={{ margin: 0 }}>
        {t("uploadPageTitle")}
      </Typography.Title>
      <Typography.Paragraph style={{ marginBottom: 0, color: token.colorTextSecondary }}>
        {t("uploadPageDesc")}
      </Typography.Paragraph>
      <Card
        variant="outlined"
        style={{
          borderStyle: "dashed",
          borderColor: isDragging ? token.colorPrimary : token.colorBorder,
          background: token.colorBgContainer,
        }}
      >
        <Upload.Dragger {...uploadProps} style={{ color: token.colorTextBase }}>
          <Space orientation="vertical" size="middle" style={{ width: "100%", color: token.colorTextBase }}>
            <Typography.Title level={3} style={{ margin: 0, color: token.colorTextBase }}>
              {t("uploadTitle")}
            </Typography.Title>
            <Typography.Text style={{ color: token.colorTextSecondary }}>{t("uploadSubtitle")}</Typography.Text>
            <Space>
              <Button
                type="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  fileRef.current?.click();
                }}
              >
                {t("uploadButton")}
              </Button>
              <input
                ref={fileRef}
                type="file"
                onChange={handleFileSelect}
                style={{ display: "none" }}
                id="file-input"
                accept={ACCEPT}
              />
            </Space>
            <Typography.Text style={{ color: token.colorTextSecondary }}>{t("supportFormats")}</Typography.Text>
          </Space>
        </Upload.Dragger>
      </Card>
      <Alert
        type="info"
        showIcon
        title={statusText}
        style={{
          background: token.colorBgElevated,
          borderColor: token.colorBorder,
          color: token.colorText,
        }}
      />
    </Space>
  );
}

