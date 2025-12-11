"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  zh: {
    translation: {
      title: "EmulatorJS 模拟器",
      uploadTitle: "拖拽 ROM 文件到此处",
      uploadSubtitle: "或点击下方按钮选择文件",
      uploadButton: "选择 ROM 文件",
      selectedPrefix: "已选择:",
      supportFormats: "支持格式: NES, SNES, N64, GBA, GB, NDS, MD, PCE 等",
      statusIdle: "请拖拽 ROM 文件或点击上传",
      statusContainerMissing: "容器缺失",
      statusLoadingCore: "正在加载核心 ({{core}})...",
      statusLaunching: "模拟器启动中...",
      statusRunning: "模拟器运行中",
      statusLoadingFailed: "加载失败: {{msg}}",
      displayPlaceholder: "模拟器将在此处显示",
      displayStarting: "模拟器正在启动中...",
      themeToLight: "切换到浅色模式",
      themeToDark: "切换到深色模式",
      langZh: "中文",
      langEn: "EN",
    },
  },
  en: {
    translation: {
      title: "EmulatorJS Emulator",
      uploadTitle: "Drop ROM file here",
      uploadSubtitle: "or click the button below to choose a file",
      uploadButton: "Choose ROM",
      selectedPrefix: "Selected:",
      supportFormats: "Supported: NES, SNES, N64, GBA, GB, NDS, MD, PCE, etc.",
      statusIdle: "Drag a ROM file here or click to upload",
      statusContainerMissing: "Display container missing",
      statusLoadingCore: "Loading core ({{core}})...",
      statusLaunching: "Starting emulator...",
      statusRunning: "Emulator running",
      statusLoadingFailed: "Failed to load: {{msg}}",
      displayPlaceholder: "Emulator will appear here",
      displayStarting: "Emulator is starting...",
      themeToLight: "Switch to light mode",
      themeToDark: "Switch to dark mode",
      langZh: "中文",
      langEn: "EN",
    },
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: "zh",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });
}

export default i18n;

