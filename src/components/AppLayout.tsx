// Client-only wrapper for SPA pages (upload/game)
"use client";

import { ConfigProvider, Layout, theme } from "antd";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { i18n } = useTranslation();
  const initialLang: Lang = i18n.language.startsWith("en") ? "en" : "zh";
  const [language, setLanguage] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const storedLang = window.localStorage.getItem("ejs_language");
      if (storedLang === "zh" || storedLang === "en") return storedLang;
    }
    return initialLang;
  });
  // Default to dark theme; will be overridden by stored preference after mount
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const storedTheme = window.localStorage.getItem("ejs_theme");
      if (storedTheme === "dark") return true;
      if (storedTheme === "light") return false;
    }
    return true;
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
          <Layout.Content style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
            {children}
          </Layout.Content>
        </Layout>
      </ConfigProvider>
    </AppStateContext.Provider>
  );
}

