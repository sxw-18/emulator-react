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
      statusReadyForGame: "文件已准备好，正在跳转到游戏页面...",
      displayPlaceholder: "模拟器将在此处显示",
      displayStarting: "模拟器正在启动中...",
      themeToLight: "切换到浅色模式",
      themeToDark: "切换到深色模式",
      langZh: "中文",
      langEn: "EN",
      uploadPageTitle: "上传 ROM 文件",
      uploadPageDesc: "选择本地 ROM 文件，上传后会自动进入游戏页面。",
      gameNeedFileTitle: "请先上传 ROM 文件",
      gameNeedFileDesc: "回到上传页选择文件后，再进入游戏页面。",
      backToUpload: "返回上传页",
      gameReplaceRom: "重新选择 ROM",
      gameHintChange: "想换一份 ROM？点击上方按钮返回上传页。",
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
      statusReadyForGame: "File ready, redirecting to the game page...",
      displayPlaceholder: "Emulator will appear here",
      displayStarting: "Emulator is starting...",
      themeToLight: "Switch to light mode",
      themeToDark: "Switch to dark mode",
      langZh: "中文",
      langEn: "EN",
      uploadPageTitle: "Upload your ROM",
      uploadPageDesc: "Pick a local ROM file. We will jump to the game page after that.",
      gameNeedFileTitle: "Upload a ROM first",
      gameNeedFileDesc: "Go back to the upload page to select a ROM, then enter the game.",
      backToUpload: "Back to upload",
      gameReplaceRom: "Choose another ROM",
      gameHintChange: "Need a different ROM? Jump back to upload above.",
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

