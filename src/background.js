/*
 * @Descripttion:
 * @version:
 * @Author: dlg
 * @Date: 2024-03-14 10:10:16
 * @LastEditors: dlg
 * @LastEditTime: 2024-03-27 16:16:47
 */
"use strict";

import {
  app,
  globalShortcut,
  protocol,
  BrowserWindow,
  Menu,
  session,
  dialog
} from "electron";
import { autoUpdater } from "electron-updater";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
const path = require("path");

// 引入本地项目中 vue-devtools 开发调试工具
const vueDevToolsPath = path.resolve(__dirname, "../vue-devtools");

// 是否是开发环境
const isDevelopment = process.env.NODE_ENV !== "production";

// 禁用默认菜单
Menu.setApplicationMenu(null);

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } }
]);

async function createWindow() {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.resolve(__dirname, "../icons/deskTop.png"),
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
      webSecurity: false // 当设置为 false, 它将禁用同源策略
    }
  });

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }

  win.maximize(); // 最大化窗口

  // 注册一个'F11'快捷键监听器
  const ret = globalShortcut.register("F11", () => {
    // 返回 boolean - 窗口当前是否已全屏
    if (win.isFullScreen()) {
      win.setFullScreen(false); // 设置窗口是否应处于全屏模式
    } else {
      win.setFullScreen(true); // 设置窗口是否应处于全屏模式
    }
  });
  if (!ret) {
    console.log("F11按键监听全屏注册失败");
  }
  // 检查快捷键是否注册成功
  console.log(
    globalShortcut.isRegistered("F11")
      ? "F11全屏功能快捷键注册成功"
      : "F11全屏功能快捷键注册失败"
  );

  // 注册一个打开控制台快捷键监听器
  const retTwo = globalShortcut.register("CommandOrControl+shift+F12", () => {
    // 返回 boolean - 窗口当前是否打开了 Devtools
    if (win.webContents.isDevToolsOpened()) {
      win.webContents.closeDevTools(); // 关闭当前页面的DevTools窗口
    } else {
      win.webContents.openDevTools(); // 打开当前页面的DevTools窗口
    }
    console.log("CommandOrControl+shift+F12 is pressed");
  });
  if (!retTwo) {
    console.log("registration failed");
  }
  // 检查快捷键是否注册成功
  console.log(
    globalShortcut.isRegistered("CommandOrControl+shift+F12")
      ? "控制台打开关闭功能注册成功"
      : "控制台打开关闭功能注册失败"
  );

  globalShortcut.register("F5", () => {
    win.reload(); //刷新页面
  });

  // 非开发环境下更新
  if (!isDevelopment) {
    // 构建更新服务器的URL并且通知autoUpdater
    const serverPath = "http://qiniu.xxxx.com";
    const url = `${serverPath}/e_vueUpdate/${process.platform}_${
      process.arch
    }/${app.getVersion()}`;

    autoUpdater.setFeedURL(url);

    // 更新进度
    autoUpdater.on("download-progress", progressObj => {
      win.webContents.send("downloadProgress", parseInt(progressObj.percent)); // 界面显示下载进度
      win.setProgressBar(parseInt(progressObj.percent) / 100); // 任务栏窗口下应用程序显示下载进度
    });
    // 更新完成并直接安装重启
    autoUpdater.on("update-downloaded", () => {
      autoUpdater.quitAndInstall();
    });
    // 捕捉更新错误
    autoUpdater.on("error", err => {
      dialog.showMessageBox({
        type: "none",
        title: "更新错误",
        message: `应用更新出现问题:${err}`
      });
    });
    // 检查更新
    autoUpdater.checkForUpdates();
  }
}

app.whenReady().then(async () => {
  // 加载vue-tools调试工具
  if (isDevelopment) {
    await session.defaultSession.loadExtension(vueDevToolsPath);
  }

  createWindow();
});

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on("will-quit", () => {
  // 注销快捷键
  globalShortcut.unregister("F11");

  // 注销所有快捷键
  // globalShortcut.unregisterAll()
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", data => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
