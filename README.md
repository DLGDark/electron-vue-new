#### 简介及注意项
- 本框架作为弃用 electron-vue 框架的最新替代品，electron-vue弃用原因：框架作者长时间没更新，一些东西已经老旧，项目工程结构也不一样，使用起来问题很多
- 故此，本人自行使用当前最新版本electron，结合vue2独立搭建的electron桌面版框架
- 使用electron v28.2.7+vue2+cli4 构建的electron桌面版项目模板
- 使用的node版本为v18.19.0，项目中自带vue-Tools功能
- 自定义全局快捷键F11全屏功能，CommandOrControl+shift+F12控制台打开关闭功能，F5刷新功能
- 因为electron版本使用的是 v28.2.7，所以，node版本必须为v18+
- 自带应用程序全量更新功能，使用的是打包工具electron-build自带的electron-update自动更新
- 打包生产环境时，需要将 `.env.production` 配置文件中的 `VUE_APP_BASE_API` 改成自己线上地址即可
- 初次使用安装项目，启动后会弹出更新错误提示框，如果暂时不用更新功能，可以注释掉background.js文件中的`autoUpdater.checkForUpdates();`，或者使用私有服务器来配置使用更新功能
- 克隆并使用本项目前提，先将本地node版本切换至v18+，本项目使用的是v18.19.0
- 构建成功之后的文件所在目录为 `dist_electron`

#### 开发
```javascript
// 安装依赖
npm install

// 项目本地启动
npm start

// 构建打包项目
npm run electron:build
```

#### 应用程序自动更新功能说明
1. vue.config.js中打包和更新相关配置
```javascript
pluginOptions: {
  electronBuilder: {
    chainWebpackMainProcess: (config) => {
      config.output.filename("background.js");
    },
    builderOptions: {
      productName: "e_vue",
      appId: "com.dlg.e_vue",
      asar: false,
      directories: {
        output: "dist_electron"
      },
      win: {
        icon: "icons/deskTop.png",
        target: [
          {
            target: "nsis",
            arch: ["ia32"]
          }
        ]
      },
      nsis: {
        oneClick: true,
        allowToChangeInstallationDirectory: false,
        createDesktopShortcut: true,
        createStartMenuShortcut: false,
        deleteAppDataOnUninstall: false,
        artifactName: "${productName}-setup-${version}.${ext}",
        shortcutName: "e_vue"
      },
      // 下面publish及其中的配置项必须有，否则打包出来的文件不正确，无法显示自动更新功能
      publish: [
        {
          provider: "generic", // 通用服务器
          url: "http://qiniu.xxxx.com/e_vueUpdate" // 更新包所在服务器下载地址
        }
      ]
    },
    // 打包后保证在页面渲染进程可以调用electron的API，以至于不会报错，如调用 ipcRenderer
    nodeIntegration: true
  },
},
```
- 上面代码中的`productName`、`appId`以及nsis里的`shortcutName`和publish中的`url`，这些都可以根据自己项目进行自行修改
- publish中的`url`为自己的更新安装包所在的私有服务器地址，e_vueUpdate是安装包在服务器上的根目录名称，到时换成自己的服务器地址即可
- 以本项目为例，则需要在七牛服务器上，创建更新安装包存放位置，最终存放目录路径为`e_vueUpdate/win32_ia32/0.1.0/`，如果要更新下一个版本，除了0.1.0这个文件目录外，还需要新建一个0.1.1的文件目录，0.1.1目录放入下一个版本，需要放入项目打包后的这三个文件：`e_vue-setup-0.1.1.exe`、`e_vue-setup-0.1.1.exe.blockmap`、`latest.yml`,而且需要将0.1.0目录下的`latest.yml`配置文件替换成下一个版本的`latest.yml`。至此，下次重新启动应用就会自动更新
- 版本更新只需要每次修改package.json文件中的`version`版本号即可
- 上面代码中`nodeIntegration: true`是为了解决渲染进程里调用electron的API导致报错的问题，比如APP.vue中`import { ipcRenderer } from "electron";`

2. background.js文件中更新相关配置
```javascript
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
```
- autoUpdater相关API请参考：[electron-build：autoUpdater](https://www.electron.build/auto-update#events)
- 本项目中的更新为全量更新，就是整个应用程序更新，但在实际场景中，有可能有时只是页面资源文件更新，此时全量更新可能不是很必要，只想更新前端资源，那就需要部分更新，即非全量更新，此项目中没有写，但本人以前写的一篇文章里有如何实现非全量更新的方法，具体请参考：[非全量更新](https://blog.csdn.net/DLGDark/article/details/123693142)


#### 正式项目中可能出现路由页面跳转404页面的问题及解决方案
- 将web后台项目使用electron打包后，可能出现点击路由菜单页面出现404页面情况，一般是因为路由路径问题导致，因为路由菜单处理页面里代码`path.resolve`中的path模块，默认操作会因 Node.js 应用程序运行所在的操作系统而异。 具体来说，当在 Windows 操作系统上运行时， path模块会假定正被使用的是 Windows 风格的路径。
- 解决方案：使用node中path里的posix API，代码变为`path.posix.resolve`，path.posix 属性提供对 path 方法的 POSIX 特定实现的访问。(意思就是无视操作系统的不同，统一为 POSIX方式，这样可以确保在任何系统上结果保持一致)。相关学习文章：[path.posix](https://blog.csdn.net/DLGDark/article/details/115553378)
- 此框架内不含有后台项目模板代码内容，此框架只作为electron-vue的替代框架，后台管理系统项目相关内容具体请自行学习~