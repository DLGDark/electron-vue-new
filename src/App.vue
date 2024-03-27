<template>
	<div id="app">
		<router-view />
		<el-dialog
			title="应用更新下载进度"
			:visible.sync="showVisible"
			width="500px"
			top="30vh"
			:show-close="true"
			:close-on-click-modal="false"
			:close-on-press-escape="false"
		>
			<div>
				<el-progress v-show="percent>0" :text-inside="true" :stroke-width="26" :percentage="percent"></el-progress>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
	name: "App",
	data() {
		return {
			showVisible: false,
			percent: 0,
		};
	},
	created() {
		// 接受主进程更新进度并显示在页面上
		ipcRenderer.on("downloadProgress", (event, percent) => {
			this.showVisible = true;
			this.percent = percent;
		});
	},
};
</script>

<style lang="scss">
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}
</style>
