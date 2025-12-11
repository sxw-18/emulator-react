"use client";

import { Alert, Card, Space, theme } from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

interface EJSWindow extends Window {
  __EJS_DATA_PATH?: string;
  __EJS_loaderPending?: boolean;
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
  EmulatorJS?: unknown;
}

// 生产环境使用官方 CDN，开发环境使用本地资源
// 如果 jsDelivr 不可用，可以尝试：
// - https://unpkg.com/emulatorjs@latest/data/
// - EmulatorJS 官方 CDN（如果有）
const DATA_PATH =
  (typeof window !== "undefined" && (window as EJSWindow).__EJS_DATA_PATH) ||
  (process.env.NODE_ENV === "development" 
    ? "/data/" 
    : "https://static.8bgame.top/data/");

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

  const ejsWindow = window as EJSWindow;

  if (ejsWindow.EmulatorJS) {
    return;
  }

  // Avoid double-injection while a previous loader is still in flight
  if (ejsWindow.__EJS_loaderPending) {
    return;
  }

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
      s.async = true;
      ejsWindow.__EJS_loaderPending = true;

      const cleanup = () => {
        s.onload = null;
        s.onerror = null;
        ejsWindow.__EJS_loaderPending = false;
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

      document.body.appendChild(s);
    } catch (error) {
      reject(error instanceof Error ? error : new Error(String(error)));
    }
  });
}

export function GamePlayer({ file, language }: { file: File; language: "zh" | "en" }) {
  const displayRef = useRef<HTMLDivElement | null>(null);
  const { t } = useTranslation();
  const { token } = theme.useToken();

  const [gameLoaded, setGameLoaded] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const [status, setStatus] = useState("");

  const enableThreads = useMemo(() => false, []);
  const enableDebug = useMemo(() => true, []);

  const cleanupGame = useCallback(() => {
    if (typeof window !== "undefined") {
      const ejsWindow = window as EJSWindow;
      if (ejsWindow.EJS_emulator) {
        try {
          (ejsWindow.EJS_emulator as { callEvent: (event: string) => void }).callEvent("exit");
        } catch (e) {
          console.warn("Error cleaning up emulator:", e);
        }
        ejsWindow.EJS_emulator = undefined;
      }
    }

    if (displayRef.current) {
      displayRef.current.innerHTML = '<div id="game"></div>';
    }
  }, []);

  useEffect(() => {
    setStatus(t("statusIdle"));
  }, [t]);

  useEffect(() => {
    let active = true;
    const boot = async () => {
      if (!file || typeof window === "undefined") return;

      cleanupGame();
      setGameLoaded(false);
      setGameStarted(false);
      setGameKey((prev) => prev + 1);

      await new Promise((resolve) => setTimeout(resolve, 100));

      const parts = file.name.split(".");
      const ext = parts.pop() ?? "";
      const core = resolveCore(ext);

      if (!displayRef.current) {
        setStatus(t("statusContainerMissing"));
        return;
      }

      displayRef.current.innerHTML = "";

      const div = document.createElement("div");
      const sub = document.createElement("div");

      sub.id = "game";
      div.id = "display";
      div.style.width = "100%";
      div.style.height = "100%";
      div.style.position = "relative";

      if (displayRef.current.parentElement) {
        displayRef.current.parentElement.style.height = "100%";
      }

      sub.style.width = "100%";
      sub.style.height = "100%";

      div.appendChild(sub);
      displayRef.current.appendChild(div);

      const dataPath = DATA_PATH.endsWith("/") ? DATA_PATH : `${DATA_PATH}/`;
      const ejsWindow = window as EJSWindow;

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

      ejsWindow.EJS_onGameStart = () => {
        if (!active) return;
        setGameStarted(true);
        setStatus(t("statusRunning"));
      };

      setStatus(t("statusLoadingCore", { core }));
      try {
        await injectLoader(dataPath + "loader.js");
        if (!active) return;
        setStatus(t("statusLaunching"));
        setGameLoaded(true);
      } catch (error) {
        if (!active) return;
        setStatus(
          t("statusLoadingFailed", {
            msg: error instanceof Error ? error.message : String(error),
          })
        );
        setGameLoaded(false);
      }
    };

    boot();

    return () => {
      active = false;
      cleanupGame();
    };
  }, [cleanupGame, enableDebug, enableThreads, file, language, t]);

  return (
    <Space orientation="vertical" size="large" style={{ width: "100%" }}>
      <Alert
        type="info"
        showIcon
        title={status}
        style={{
          background: token.colorBgElevated,
          borderColor: token.colorBorder,
          color: token.colorText,
        }}
      />
      <Card
        variant="outlined"
        style={{
          width: "100%",
          background: token.colorBgContainer,
          borderColor: token.colorBorder,
          overflow: "hidden",
        }}
        styles={{ body: { padding: 0 } }}
      >
        <div
          key={gameKey}
          ref={displayRef}
          id="display-container"
          style={{ height: 520 }}
          suppressHydrationWarning
        >
          {!gameLoaded && gameKey === 0 && (
            <div
              style={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                color: token.colorTextSecondary,
              }}
            >
              {t("displayPlaceholder")}
            </div>
          )}
          {gameLoaded && !gameStarted && (
            <div
              style={{
                display: "flex",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                color: token.colorTextSecondary,
              }}
            >
              {t("displayStarting")}
            </div>
          )}
        </div>
      </Card>
    </Space>
  );
}

