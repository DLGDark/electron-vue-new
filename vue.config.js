/*
 * @Descripttion:
 * @version:
 * @Author: dlg
 * @Date: 2020-06-15 13:36:21
 * @LastEditors: dlg
 * @LastEditTime: 2024-03-27 12:11:43
 */
"use strict";
const path = require("path");

function resolve(dir) {
	return path.join(__dirname, dir);
}

module.exports = {
	publicPath: "/",
	outputDir: "dist",
	assetsDir: "static",
	lintOnSave: process.env.NODE_ENV !== "production", //在生产构建时禁用 eslint-loader
	productionSourceMap: false, //加速生产环境构建
	devServer: {
		port: 9020,
		// open: true, //自动打开默认浏览器
		overlay: {
			// 出现编译器错误或警告时，在浏览器中显示全屏覆盖,下面配置只显示错误
			warnings: false,
			errors: true,
		},
		proxy: {
			"/admin": {
				target: "http://192.168.0.232:1212",
				changeOrigin: true,
			},
		},
	},
	// 默认babel-loader忽略mode_modules，这里可增加例外的依赖包名
	// Babel 显式转译列表，es6,se6+ 转换为 es5
	transpileDependencies: [],
	configureWebpack: {
		name: "electron桌面系统",
		resolve: {
			alias: {
				"@": resolve("src"),
			},
		},
	},
	// chainWebpack 中文文档地址如下
	// https://github.com/Yatoo2018/webpack-chain/tree/zh-cmn-Hans
	chainWebpack(config) {
		// 移除以下两个插件
		config.plugins.delete("preload"); //用来指定页面加载后很快会被用到的资源
		config.plugins.delete("prefetch"); //用来告诉浏览器在页面加载完成后，利用空闲时间提前获取用户未来可能会访问的内容

		config.module
			.rule("vue")
			.use("vue-loader")
			.loader("vue-loader")
			.tap((options) => {
				options.compilerOptions.preserveWhitespace = true;
				return options;
			})
			.end();

		// 条件执行一个函数去继续配置
		// condition: Boolean
		// whenTruthy: Function -> ChainedMap
		// 当条件为真，调用把ChainedMap实例作为单一参数传入的函数
		// whenFalsy: Optional Function -> ChainedMap
		// 当条件为假，调用把ChainedMap实例作为单一参数传入的函数
		// when(condition, whenTruthy, whenFalsy)
		config.when(process.env.NODE_ENV === "development", (config) =>
			config.devtool("cheap-source-map")
		);

		config.when(process.env.NODE_ENV !== "development", (config) => {
			config.optimization.splitChunks({
				chunks: "all",
				cacheGroups: {
					libs: {
						name: "chunk-libs",
						test: /[\\/]node_modules[\\/]/,
						priority: 10,
						chunks: "initial", // 只打包初始时依赖的第三方
					},
					elementUI: {
						name: "chunk-elementUI", // 单独将 elementUI 拆包
						priority: 20, // 权重要大于 libs 和 app 不然会被打包进 libs 或者 app
						test: /[\\/]node_modules[\\/]_?element-ui(.*)/, // 适应cnpm方式安装的依赖包
					},
					commons: {
						name: "chunk-commons",
						test: resolve("src/components"), // 可自定义拓展你的规则
						minChunks: 3, // 最小公用次数
						priority: 5,
						reuseExistingChunk: true, //如果当前块包含已从主束拆分的模块，则将重用它而不是生成新的块
					},
				},
			});
			config.optimization.runtimeChunk("single"); //'single'该值创建一个运行时文件以供所有生成的块共享
		});
	},
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
};
