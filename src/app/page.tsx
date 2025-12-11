"use client";

import { Layout, Typography, Upload, Button, Card, Space, Alert, ConfigProvider, theme } from "antd";
import type { UploadProps } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { AppHeader } from "../components/AppHeader";
import "../i18n";

interface EJSWindow extends Window {
  __EJS_DATA_PATH?: string;
  EJS_player?: string;
  EJS_gameName?: string;
  EJS_biosUrl?: string;
  EJS_gameUrl?: File | string;
  EJS_core?: string;
  EJS_pathtodata?: string;
  EJS_language?: string;
  EJS_startOnLoaded?: boolean;
  EJS_DEBUG_XX?: boolean;
  EJS_disableDatabases?: boolean;
  EJS_threads?: boolean;
  EJS_emulator?: unknown;
  EJS_onGameStart?: () => void;
}

const DATA_PATH =
  (typeof window !== "undefined" &&
    (window as EJSWindow).__EJS_DATA_PATH) ||
  (process.env.NODE_ENV === "development"
    ? "/data/" // 使用重写路径而不是直接访问 8080 端口
    : "/data/"); // 生产环境中也使用相对路径或 CDN

type CoreKey =
  | "nes"
  | "snes"
  | "n64"
  | "pce"
  | "ngp"
  | "ws"
  | "coleco"
  | "vice_x64sc"
  | "segaMD"
  | "nds"
  | "gba"
  | "gb"
  | "psx"
  | "vb"
  | "segaMS"
  | "segaCD"
  | "lynx"
  | "sega32x"
  | "jaguar"
  | "segaGG"
  | "segaSaturn"
  | "atari7800"
  | "atari2600"
  | "arcade"
  | "pcfx";

function resolveCore(ext: string): CoreKey {
  const e = ext.toLowerCase();
  if (["fds", "nes", "unif", "unf"].includes(e)) return "nes";
  if (["smc", "fig", "sfc", "gd3", "gd7", "dx2", "bsx", "swc"].includes(e)) return "snes";
  if (["z64", "n64"].includes(e)) return "n64";
  if (["pce"].includes(e)) return "pce";
  if (["ngp", "ngc"].includes(e)) return "ngp";
  if (["ws", "wsc"].includes(e)) return "ws";
  if (["col", "cv"].includes(e)) return "coleco";
  if (["d64"].includes(e)) return "vice_x64sc";
  if (["md", "sg", "smd", "gen"].includes(e)) return "segaMD";
  if (["nds", "gba", "gb"].includes(e)) return e as CoreKey;
  return "gba";
}

async function injectLoader(src: string): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Cannot inject loader on server");
  }
  
  // 移除已存在的 loader（安全地）
  const existing = document.querySelector<HTMLScriptElement>('script[data-ejs-loader="true"]');
  if (existing) {
    const parent = existing.parentNode;
    if (parent && parent.contains(existing)) {
      parent.removeChild(existing);
    } else if (existing.parentNode) {
      existing.parentNode.removeChild(existing);
    } else {
      existing.remove();
    }
  }
  
  return new Promise<void>((resolve, reject) => {
    try {
      const s = document.createElement("script");
      s.setAttribute("data-ejs-loader", "true");
      s.src = src;
      // 与原始HTML保持一致
      s.async = true;
      
      const cleanup = () => {
        s.onload = null;
        s.onerror = null;
      };
      
      s.onload = () => {
        cleanup();
        resolve();
      };
      
      s.onerror = () => {
        cleanup();
        const parent = s.parentNode;
        if (parent && parent.contains(s)) {
          parent.removeChild(s);
        } else {
          s.remove();
        }
        reject(new Error(`Failed to load loader: ${src}`));
      };
      
      // 直接添加到body，与原始HTML保持一致
      document.body.appendChild(s);
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export default function Home() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const displayRef = useRef<HTMLDivElement | null>(null);
  const { t, i18n } = useTranslation();
  const initialLang: "zh" | "en" = i18n.language.startsWith("en") ? "en" : "zh";
  const [language, setLanguage] = useState<"zh" | "en">(initialLang);
  const [status, setStatus] = useState(i18n.getFixedT(initialLang)("statusIdle"));
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false); // 新增状态跟踪游戏是否真正开始
  const [gameKey, setGameKey] = useState(0);
  const [isDark, setIsDark] = useState(false);

  const enableThreads = useMemo(() => false, []);
  const enableDebug = useMemo(() => true, []);

  // 清理函数，确保在组件卸载或重新渲染时正确清理游戏实例
  const cleanupGame = useCallback(() => {
    if (typeof window !== "undefined") {
      const ejsWindow = window as EJSWindow;
      if (ejsWindow.EJS_emulator) {
        try {
          // 尝试调用退出事件 (使用类型断言因为我们知道对象存在该方法)
          (ejsWindow.EJS_emulator as { callEvent: (event: string) => void }).callEvent("exit");
        } catch (e) {
          console.warn("Error cleaning up emulator:", e);
        }
        ejsWindow.EJS_emulator = undefined;
      }
    }
    
    // 清理容器
    if (displayRef.current) {
      displayRef.current.innerHTML = '<div id="game"></div>';
    }
  }, []);

  // 确保只在客户端执行
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // 组件卸载时清理
    return () => {
      cleanupGame();
    };
  }, [cleanupGame]);

  const handleFile = useCallback(async (file: File) => {
    if (!file || typeof window === "undefined") return;
    
    // 先清理之前的游戏实例
    cleanupGame();
    
    setSelectedFile(file);
    setGameLoaded(false);
    setGameStarted(false);
    
    // 强制重新渲染游戏容器
    setGameKey(prev => prev + 1);
    
    // 等待 React 完成渲染
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const parts = file.name.split(".");
    const ext = parts.pop() ?? "";
    const core = resolveCore(ext);

    if (!displayRef.current) {
      setStatus(t("statusContainerMissing"));
      return;
    }

    // 完全按照原始HTML的方式创建容器结构
    // 移除现有的内容并创建新的结构
    displayRef.current.innerHTML = '';
  
    const div = document.createElement("div");
    const sub = document.createElement("div");
  
  sub.id = "game";
  div.id = "display";
  
  // 设置样式确保正确显示，特别注意尺寸设置
  div.style.width = "100%";
  div.style.height = "100%";
  div.style.position = "relative";
  
  // 确保父容器也有明确的尺寸
  if (displayRef.current.parentElement) {
    displayRef.current.parentElement.style.height = "100%";
  }
  
  sub.style.width = "100%";
  sub.style.height = "100%";
  
  div.appendChild(sub);
  displayRef.current.appendChild(div);

  const dataPath = DATA_PATH.endsWith("/") ? DATA_PATH : DATA_PATH + "/";
  const ejsWindow = window as EJSWindow;

  // 设置 EJS 配置（完全按照原始HTML）
  ejsWindow.EJS_player = "#game";
  ejsWindow.EJS_gameName = parts.shift() || undefined;
  ejsWindow.EJS_biosUrl = "";
  ejsWindow.EJS_gameUrl = file;
  ejsWindow.EJS_core = core;
  ejsWindow.EJS_pathtodata = dataPath;
  ejsWindow.EJS_language = language;
  ejsWindow.EJS_startOnLoaded = true;
  ejsWindow.EJS_DEBUG_XX = enableDebug;
  ejsWindow.EJS_disableDatabases = true;
  ejsWindow.EJS_threads = enableThreads;

  // 监听游戏开始事件
  ejsWindow.EJS_onGameStart = () => {
    setGameStarted(true);
    setStatus(t("statusRunning"));
  };

  setStatus(t("statusLoadingCore", { core }));
  try {
    await injectLoader(dataPath + "loader.js");
    setStatus(t("statusLaunching"));
    setGameLoaded(true);
  } catch (error) {
    setStatus(
      t("statusLoadingFailed", {
        msg: error instanceof Error ? error.message : String(error),
      })
    );
    setGameLoaded(false);
  }
}, [enableDebug, enableThreads, cleanupGame, language, t]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const uploadProps = useMemo<UploadProps>(() => ({
    multiple: false,
    showUploadList: false,
    accept: ".zip,.7z,.nes,.sfc,.smc,.gba,.gb,.gbc,.nds,.n64,.z64,.pce,.md,.gen,.smd,.iso,.bin,.img,.fds,.unif,.unf,.fig,.gd3,.gd7,.dx2,.bsx,.swc,.ngp,.ngc,.ws,.wsc,.col,.cv,.d64",
    beforeUpload: (file: File) => {
      handleFile(file);
      return false; // 阻止自动上传
    },
    onDrop: (e: React.DragEvent<HTMLElement>) => {
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
    },
    onDragOver: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
  }), [handleFile]);

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
    <ConfigProvider theme={themeConfig}>
      <Layout style={{ minHeight: "100vh", background: themeConfig.token.colorBgBase }}>
        <AppHeader
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          language={language}
          onLanguageChange={(lang) => {
            i18n.changeLanguage(lang).then(() => {
              setLanguage(lang);
              setStatus(i18n.getFixedT(lang)("statusIdle"));
            });
          }}
          colors={{
            textBase: themeConfig.token.colorTextBase,
            border: themeConfig.token.colorBorder,
            background: isDark ? "#0b1220" : "#ffffff",
          }}
        />
        <Layout.Content style={{ padding: "32px 24px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          <Space orientation="vertical" size="large" style={{ width: "100%" }}>
            <Card
              variant="outlined"
              style={{
                borderStyle: "dashed",
                borderColor: isDragging ? themeConfig.token.colorPrimary : themeConfig.token.colorBorder,
                background: themeConfig.components.Card?.colorBgContainer,
              }}
        >
              <Upload.Dragger {...uploadProps} style={{ color: themeConfig.token.colorTextBase }}>
                <Space orientation="vertical" size="middle" style={{ width: "100%", color: themeConfig.token.colorTextBase }}>
                  <Typography.Title level={3} style={{ margin: 0, color: themeConfig.token.colorTextBase }}>
                    {t("uploadTitle")}
                  </Typography.Title>
                  <Typography.Text style={{ color: themeConfig.token.colorTextSecondary }}>
                    {t("uploadSubtitle")}
                  </Typography.Text>
                  <Space>
                    <Button type="primary" onClick={() => fileRef.current?.click()}>
                      {t("uploadButton")}
                    </Button>
              <input
                ref={fileRef}
                type="file"
                onChange={handleFileSelect}
                      style={{ display: "none" }}
                id="file-input"
                accept=".zip,.7z,.nes,.sfc,.smc,.gba,.gb,.gbc,.nds,.n64,.z64,.pce,.md,.gen,.smd,.iso,.bin,.img,.fds,.unif,.unf,.fig,.gd3,.gd7,.dx2,.bsx,.swc,.ngp,.ngc,.ws,.wsc,.col,.cv,.d64"
              />
              {selectedFile && (
                      <Typography.Text style={{ color: themeConfig.token.colorTextBase }}>
                        {t("selectedPrefix")} {selectedFile.name}
                      </Typography.Text>
              )}
                  </Space>
                  <Typography.Text style={{ color: themeConfig.token.colorTextSecondary }}>
                    {t("supportFormats")}
                  </Typography.Text>
                </Space>
              </Upload.Dragger>
            </Card>

        {status && (
              <Alert
                title={status}
                type="info"
                showIcon
                style={{
                  background: themeConfig.components.Alert?.colorBgContainer,
                  borderColor: themeConfig.components.Alert?.colorBorder,
                  color: themeConfig.components.Alert?.colorText,
                }}
              />
        )}

            <Card
              variant="outlined"
              style={{
                width: "100%",
                background: isDark ? "#0b1220" : "#ffffff",
                borderColor: themeConfig.token.colorBorder,
              }}
            >
        <div
          key={gameKey}
          ref={displayRef}
          id="display-container"
                style={{ height: 480 }}
          suppressHydrationWarning
        >
          {!gameLoaded && gameKey === 0 && (
                  <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: isDark ? "#94a3b8" : "#475569" }}>
                    {t("displayPlaceholder")}
            </div>
          )}
          {gameLoaded && !gameStarted && (
                  <div style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: themeConfig.token.colorTextSecondary }}>
                    {t("displayStarting")}
            </div>
          )}
        </div>
            </Card>
          </Space>
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  );
}
