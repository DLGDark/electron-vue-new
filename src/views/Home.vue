<!--
 * @Descripttion:
 * @version:
 * @Author: dlg
 * @Date: 2024-03-27 15:27:31
 * @LastEditors: dlg
 * @LastEditTime: 2024-03-27 16:01:24
-->
<template>
	<div class="home">
		<img alt="logo" src="../assets/logo.png" />
		<Tips />
	</div>
</template>

<script>
import Tips from "@/components/Tips.vue";

export default {
	name: "Home",
	components: {
		Tips,
	},
};
</script>
<style scoped>
.home {
	margin-top: 24vh;
}
</style>