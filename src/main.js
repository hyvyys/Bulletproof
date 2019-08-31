import Vue from "vue";
Vue.config.productionTip = false;

import Vuebar from "vuebar";
Vue.use(Vuebar);

import "@/scss/styles.scss";
import App from "@/App.vue";

import router from "@/router";
import store from '@/store';

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");
