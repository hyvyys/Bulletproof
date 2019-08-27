import Vue from "vue";
import Vuebar from "vuebar";

import "./scss/styles.scss";

import App from "./App.vue";
import router from "./router";

Vue.config.productionTip = false;
Vue.use(Vuebar);

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
