import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

import "normalize.css/normalize.css"; // A modern alternative to CSS resets

import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";

import "@/assets/globalStyle/index.scss"; //引入自定义全局样式

Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
