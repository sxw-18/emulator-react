"use client";

import Link from "next/link";
import { AppLayout, useAppState } from "@/components/AppLayout";
import { useTranslation } from "react-i18next";
import { theme } from "antd";
import "../i18n";

function HomeContent() {
  const { t } = useTranslation();
  const { isDark } = useAppState();
  const { token } = theme.useToken();

  const features = [
    { title: t("homeFeaturePlayNow"), desc: t("homeFeaturePlayNowDesc") },
    { title: t("homeFeatureMultiCore"), desc: t("homeFeatureMultiCoreDesc") },
    { title: t("homeFeatureController"), desc: t("homeFeatureControllerDesc") },
    { title: t("homeFeatureNoPlugin"), desc: t("homeFeatureNoPluginDesc") },
  ].filter((item) => item && item.title && item.desc); // Filter out any undefined items

  // 根据主题动态设置颜色
  const heroTextColor = token.colorTextSecondary;
  const heroTitleColor = token.colorTextBase;
  const secondaryButtonBorder = token.colorBorder;
  const secondaryButtonColor = token.colorTextBase;
  const featureCardBg = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.02)";
  const featureCardBorder = isDark ? "rgba(148, 163, 184, 0.2)" : "rgba(0, 0, 0, 0.1)";
  const featureTitleColor = token.colorTextBase;
  const featureDescColor = token.colorTextSecondary;
  const rightCardBg = isDark ? "rgba(15, 23, 42, 0.9)" : "#ffffff";
  const rightCardBorder = token.colorBorder;
  const rightCardShadow = isDark ? "0 20px 60px rgba(0, 0, 0, 0.45)" : "0 4px 12px rgba(0, 0, 0, 0.08)";
  const innerCardBg = isDark ? "#0b1220" : "#f8fafc";
  const innerCardBorder = isDark ? "rgba(148, 163, 184, 0.35)" : token.colorBorder;
  const innerCardText = token.colorTextSecondary;
  const innerCardTitle = token.colorTextBase;
  const tipCardBg = isDark ? "#0f172a" : "#f1f5f9";
  const tipCardBorder = token.colorBorder;
  const tipCardText = token.colorTextSecondary;

  return (
    <div className="hero-grid" style={{ padding: "24px",paddingTop: "60px",maxWidth: 1100, margin: "0 auto", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
        <h1 style={{ fontSize: 44, lineHeight: 1.1, margin: "0 0 16px", color: heroTitleColor }}>
          {t("homeHeroTitle")}
        </h1>
        <p style={{ fontSize: 18, color: heroTextColor, marginBottom: 24 }}>
          {t("homeHeroDesc")}
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
          <Link
            href="/upload"
            style={{
              padding: "12px 20px",
              borderRadius: 10,
              background: token.colorPrimary,
              color: "#ffffff",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: isDark ? "0 10px 30px rgba(22, 119, 255, 0.35)" : "0 4px 12px rgba(22, 119, 255, 0.25)",
            }}
          >
            {t("homeButtonUpload")}
          </Link>
          <Link
            href="/game"
            style={{
              padding: "12px 20px",
              borderRadius: 10,
              border: `1px solid ${secondaryButtonBorder}`,
              color: secondaryButtonColor,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {t("homeButtonGame")}
          </Link>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {features.map((item) => (
            <div
              key={item.title}
              style={{
                padding: 14,
                borderRadius: 12,
                background: featureCardBg,
                border: `1px solid ${featureCardBorder}`,
              }}
            >
              <p style={{ margin: "0 0 6px", fontWeight: 700, color: featureTitleColor }}>{item.title}</p>
              <p style={{ margin: 0, color: featureDescColor, fontSize: 14 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          background: rightCardBg,
          border: `1px solid ${rightCardBorder}`,
          borderRadius: 16,
          padding: 20,
          boxShadow: rightCardShadow,
        }}
      >
        <div
          style={{
            background: innerCardBg,
            borderRadius: 12,
            padding: 16,
            border: `1px dashed ${innerCardBorder}`,
            color: innerCardText,
            fontSize: 14,
            lineHeight: 1.6,
          }}
        >
          <h3 style={{ margin: "0 0 10px", color: innerCardTitle }}>{t("homeProcessTitle")}</h3>
          <ol style={{ paddingLeft: 20, margin: 0, display: "grid", gap: 8 }}>
            <li>{t("homeProcessStep1")}</li>
            <li>{t("homeProcessStep2")}</li>
            <li>{t("homeProcessStep3")}</li>
          </ol>
        </div>
        <div
          style={{
            marginTop: 16,
            background: tipCardBg,
            borderRadius: 12,
            padding: 16,
            border: `1px solid ${tipCardBorder}`,
            color: tipCardText,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {t("homeTip")}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <AppLayout>
      <HomeContent />
    </AppLayout>
  );
}
