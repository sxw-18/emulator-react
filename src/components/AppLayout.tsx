// Client-only wrapper for SPA pages (upload/game)
"use client";

import { Breadcrumb, Button, ConfigProvider, Layout, theme } from "antd";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AppHeader } from "./AppHeader";
import "../i18n";

type Lang = "zh" | "en";

type AppState = {
  language: Lang;
  setLanguage: (lang: Lang) => void;
  isDark: boolean;
  toggleTheme: () => void;
  selectedFile: File | null;
  setSelectedFile: (file: File | null) => void;
};

const AppStateContext = createContext<AppState | null>(null);

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within AppLayout");
  }
  return ctx;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const initialLang: Lang = i18n.language.startsWith("en") ? "en" : "zh";
  const [language, setLanguage] = useState<Lang>(initialLang);
  // Default to dark theme; will be overridden by stored preference after mount
  const [isDark, setIsDark] = useState<boolean>(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Hydrate theme/language from storage after mount to avoid SSR mismatch
  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedLang = window.localStorage.getItem("ejs_language");
    const storedTheme = window.localStorage.getItem("ejs_theme");

    queueMicrotask(() => {
      setLanguage((prev) => {
        if (storedLang === "zh" || storedLang === "en") {
          return storedLang === prev ? prev : storedLang;
        }
        return prev;
      });

      setIsDark((prev) => {
        if (storedTheme === "dark") return true;
        if (storedTheme === "light") return false;
        return prev;
      });
    });
  }, []);

  useEffect(() => {
    i18n.changeLanguage(language);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ejs_language", language);
    }
  }, [i18n, language]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ejs_theme", isDark ? "dark" : "light");
    }
  }, [isDark]);

  const themeConfig = useMemo(
    () => ({
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorBgBase: isDark ? "#0c1117" : "#f8fafc",
        colorTextBase: isDark ? "#f8fafc" : "#0f172a",
        colorTextSecondary: isDark ? "#cbd5e1" : "#475569",
        colorPrimary: "#1677ff",
        colorBorder: isDark ? "#27303d" : "#d9e1ec",
        colorBorderSecondary: isDark ? "#1f2632" : "#e5e8ef",
      },
      components: {
        Card: {
          colorBgContainer: isDark ? "#111827" : "#ffffff",
          colorBorderSecondary: isDark ? "#27303d" : "#e5e8ef",
        },
        Alert: {
          colorBgContainer: isDark ? "#0f172a" : "#f8fafc",
          colorBorder: isDark ? "#27303d" : "#d9e1ec",
          colorText: isDark ? "#e2e8f0" : "#0f172a",
          colorIcon: "#1677ff",
        },
        Upload: {
          colorTextDescription: isDark ? "#cbd5e1" : "#475569",
        },
        Typography: {
          colorTextSecondary: isDark ? "#cbd5e1" : "#475569",
        },
      },
    }),
    [isDark]
  );

  const breadcrumbs = useMemo(() => {
    const map: Record<string, string> = {
      "/upload": t("breadcrumbUpload"),
      "/game": t("breadcrumbGame"),
    };
    const current = map[pathname];
    if (!current) return [];
    return [
      { title: <Link href="/">{t("breadcrumbHome")}</Link> },
      { title: current },
    ];
  }, [pathname, t]);

  return (
    <AppStateContext.Provider
      value={{
        language,
        setLanguage,
        isDark,
        toggleTheme: () => setIsDark((prev) => !prev),
        selectedFile,
        setSelectedFile,
      }}
    >
      <ConfigProvider theme={themeConfig}>
        <Layout style={{ minHeight: "100vh", background: themeConfig.token.colorBgBase }}>
          <AppHeader
            isDark={isDark}
            onToggleTheme={() => setIsDark((prev) => !prev)}
            language={language}
            onLanguageChange={setLanguage}
            colors={{
              textBase: themeConfig.token.colorTextBase,
              border: themeConfig.token.colorBorder,
              background: isDark ? "#0b1220" : "#ffffff",
            }}
          />
          <Layout.Content className="app-content">
            {breadcrumbs.length > 0 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 16,
                }}
              >
                <Button
                  type="text"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => router.push("/")}
                  style={{ color: themeConfig.token.colorTextBase, padding: "4px 8px" }}
                >
                  {t("breadcrumbBack")}
                </Button>
                <Breadcrumb items={breadcrumbs} />
              </div>
            )}
            {children}
          </Layout.Content>
        </Layout>
      </ConfigProvider>
    </AppStateContext.Provider>
  );
}

