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

async function injectLoader(src: string, forceReload: boolean = false): Promise<void> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    throw new Error("Cannot inject loader on server");
  }

  const ejsWindow = window as EJSWindow;

  // 如果强制重新加载，清理旧的实例
  if (forceReload) {
    // 等待一小段时间确保之前的清理完成
    await new Promise((resolve) => setTimeout(resolve, 100));
    
    // 清理旧的 EmulatorJS 实例（如果存在）
    if (ejsWindow.EmulatorJS) {
      try {
        // EmulatorJS 可能没有明确的清理方法，但我们可以重置它
        ejsWindow.EmulatorJS = undefined;
      } catch (e) {
        console.warn("Error clearing EmulatorJS:", e);
      }
    }
    
    // 重置加载状态
    ejsWindow.__EJS_loaderPending = false;
  } else {
    // 如果已经加载且不强制重新加载，直接返回
    if (ejsWindow.EmulatorJS) {
      return;
    }

    // Avoid double-injection while a previous loader is still in flight
    if (ejsWindow.__EJS_loaderPending) {
      // 等待加载完成
      let attempts = 0;
      while (ejsWindow.__EJS_loaderPending && attempts < 50) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
      if (ejsWindow.EmulatorJS) {
        return;
      }
    }
  }

  // 清理旧的脚本标签
  const existing = document.querySelectorAll<HTMLScriptElement>('script[data-ejs-loader="true"]');
  existing.forEach((script) => {
    try {
      // 移除事件监听器
      script.onload = null;
      script.onerror = null;
      
      // 移除脚本标签
      const parent = script.parentNode;
      if (parent && parent.contains(script)) {
        parent.removeChild(script);
      } else if (script.parentNode) {
        script.parentNode.removeChild(script);
      } else {
        script.remove();
      }
    } catch (e) {
      console.warn("Error removing existing loader script:", e);
    }
  });

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
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    const ejsWindow = window as EJSWindow;

    // 1. 停止并销毁模拟器实例
    if (ejsWindow.EJS_emulator) {
      try {
        const emulator = ejsWindow.EJS_emulator as {
          callEvent?: (event: string) => void;
          exit?: () => void;
          pause?: () => void;
          stop?: () => void;
          destroy?: () => void;
        };

        // 尝试多种清理方法
        if (typeof emulator.pause === "function") {
          try {
            emulator.pause();
          } catch (e) {
            console.warn("Error pausing emulator:", e);
          }
        }

        if (typeof emulator.callEvent === "function") {
          try {
            emulator.callEvent("exit");
          } catch (e) {
            console.warn("Error calling exit event:", e);
          }
        }

        if (typeof emulator.exit === "function") {
          try {
            emulator.exit();
          } catch (e) {
            console.warn("Error exiting emulator:", e);
          }
        }

        if (typeof emulator.stop === "function") {
          try {
            emulator.stop();
          } catch (e) {
            console.warn("Error stopping emulator:", e);
          }
        }

        if (typeof emulator.destroy === "function") {
          try {
            emulator.destroy();
          } catch (e) {
            console.warn("Error destroying emulator:", e);
          }
        }
      } catch (e) {
        console.warn("Error cleaning up emulator:", e);
      } finally {
        ejsWindow.EJS_emulator = undefined;
      }
    }

    // 2. 清理所有相关的全局变量
    ejsWindow.EJS_onGameStart = undefined;
    ejsWindow.EJS_player = undefined;
    ejsWindow.EJS_gameName = undefined;
    ejsWindow.EJS_biosUrl = undefined;
    ejsWindow.EJS_gameUrl = undefined;
    ejsWindow.EJS_core = undefined;
    ejsWindow.EJS_pathtodata = undefined;
    ejsWindow.EJS_language = undefined;
    ejsWindow.EJS_startOnLoaded = undefined;
    ejsWindow.EJS_DEBUG_XX = undefined;
    ejsWindow.EJS_disableDatabases = undefined;
    ejsWindow.EJS_threads = undefined;

    // 3. 清理DOM元素
    if (displayRef.current) {
      displayRef.current.innerHTML = "";
    }

    // 4. 清理可能存在的游戏容器
    const gameContainer = document.getElementById("game");
    if (gameContainer) {
      gameContainer.innerHTML = "";
    }

    const displayContainer = document.getElementById("display");
    if (displayContainer) {
      displayContainer.innerHTML = "";
    }

    // 5. 清理可能存在的canvas元素
    const canvases = document.querySelectorAll<HTMLCanvasElement>("#game canvas, #display canvas");
    canvases.forEach((canvas) => {
      try {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        canvas.remove();
      } catch (e) {
        console.warn("Error cleaning up canvas:", e);
      }
    });

    // 6. 清理可能存在的音频元素
    const audioElements = document.querySelectorAll("#game audio, #display audio");
    audioElements.forEach((audio) => {
      try {
        (audio as HTMLAudioElement).pause();
        (audio as HTMLAudioElement).src = "";
        audio.remove();
      } catch (e) {
        console.warn("Error cleaning up audio:", e);
      }
    });

    // 7. 清理可能存在的Web Workers
    // EmulatorJS 可能使用 Web Workers，但无法直接清理它们
    // 它们会在页面卸载时自动清理
  }, []);

  useEffect(() => {
    setStatus(t("statusIdle"));
  }, [t]);

  // 处理页面可见性变化，解决浏览器切换到后台后卡住的问题
  useEffect(() => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return;
    }

    let resumeTimeout: NodeJS.Timeout | null = null;

    const handleVisibilityChange = () => {
      const ejsWindow = window as EJSWindow;
      
      if (document.visibilityState === "visible") {
        // 页面重新可见时，恢复模拟器
        if (ejsWindow.EJS_emulator && gameStarted) {
          // 延迟一下，确保页面完全可见
          if (resumeTimeout) {
            clearTimeout(resumeTimeout);
          }
          
          resumeTimeout = setTimeout(() => {
            try {
              // 尝试恢复模拟器
              const emulator = ejsWindow.EJS_emulator as {
                callEvent?: (event: string) => void;
                resume?: () => void;
                pause?: () => void;
                restart?: () => void;
              };
              
              // 先尝试调用 resume 方法
              if (typeof emulator.resume === "function") {
                emulator.resume();
              }
              // 如果没有 resume，尝试通过 callEvent 恢复
              else if (typeof emulator.callEvent === "function") {
                try {
                  emulator.callEvent("resume");
                } catch {
                  // 如果 resume 事件不存在，尝试其他方法
                  console.warn("Resume event not available, trying alternative methods");
                }
              }
              
              // 恢复音频上下文（如果存在）
              if (typeof AudioContext !== "undefined") {
                // 查找页面中可能存在的音频上下文并恢复
                const audioElements = document.querySelectorAll("audio");
                // Convert NodeList to Array and filter out null/undefined
                Array.from(audioElements).forEach((audio) => {
                  if (audio && audio.paused) {
                    audio.play().catch((e) => {
                      console.warn("Failed to resume audio:", e);
                    });
                  }
                });
                
                // 尝试恢复 Web Audio API 上下文
                // EmulatorJS 可能使用 Web Audio API
                const canvas = document.querySelector("#game canvas") as HTMLCanvasElement | null;
                if (canvas) {
                  // 触发一个重绘，帮助恢复渲染循环
                  canvas.style.display = "none";
                  void canvas.offsetHeight; // 触发重排
                  canvas.style.display = "";
                }
              }
              
              console.log("Game resumed from background");
            } catch (error) {
              console.warn("Error resuming emulator:", error);
            }
          }, 100);
        }
      } else if (document.visibilityState === "hidden") {
        // 页面隐藏时，清理定时器
        if (resumeTimeout) {
          clearTimeout(resumeTimeout);
          resumeTimeout = null;
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    // 也监听 focus 事件作为备用方案
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        handleVisibilityChange();
      }
    };
    
    window.addEventListener("focus", handleFocus);
    
    // 监听用户交互，用于恢复音频上下文
    const handleUserInteraction = () => {
      if (document.visibilityState === "visible" && gameStarted) {
        const ejsWindow = window as EJSWindow;
        if (ejsWindow.EJS_emulator) {
          // 用户交互后，尝试恢复音频
          const audioElements = document.querySelectorAll("audio");
          // Convert NodeList to Array and filter out null/undefined
          Array.from(audioElements).forEach((audio) => {
            if (audio && audio.paused) {
              audio.play().catch(() => {
                // 忽略错误，可能已经恢复了
              });
            }
          });
        }
      }
    };
    
    // 监听点击和触摸事件来恢复音频
    document.addEventListener("click", handleUserInteraction, { once: true });
    document.addEventListener("touchstart", handleUserInteraction, { once: true });
    document.addEventListener("keydown", handleUserInteraction, { once: true });

    return () => {
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("click", handleUserInteraction);
      document.removeEventListener("touchstart", handleUserInteraction);
      document.removeEventListener("keydown", handleUserInteraction);
    };
  }, [gameStarted]);

  useEffect(() => {
    let active = true;
    let cleanupComplete = false;
    
    const boot = async () => {
      if (!file || typeof window === "undefined") return;

      // 先清理旧的模拟器实例
      cleanupGame();
      cleanupComplete = true;
      
      // 重置状态
      setGameLoaded(false);
      setGameStarted(false);
      setGameKey((prev) => prev + 1);

      // 等待足够的时间确保清理完成，并让DOM更新
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      // 再次检查是否仍然活跃（用户可能已经导航离开）
      if (!active) return;

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
        // 强制重新加载loader，确保清理旧的实例
        await injectLoader(dataPath + "loader.js", true);
        if (!active) return;
        setStatus(t("statusLaunching"));
        setGameLoaded(true);
      } catch (error) {
        if (!active) return;
        console.error("Failed to load emulator:", error);
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
      // 只有在清理未完成时才执行清理
      // 如果清理已完成，说明组件正在卸载，需要再次清理
      if (cleanupComplete) {
        // 延迟清理，确保组件完全卸载
        setTimeout(() => {
          cleanupGame();
        }, 0);
      } else {
        cleanupGame();
      }
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

