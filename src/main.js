import Vue from "vue";

Vue.config.productionTip = false;

import Vuebar from "vuebar";
Vue.use(Vuebar);

import VueObserveVisibility from 'vue-observe-visibility'
Vue.use(VueObserveVisibility);

import VueWorker from 'vue-worker';
Vue.use(VueWorker);

import "@/scss/styles.scss";
import App from "@/App.vue";

import router from "@/router";
import store from '@/store/';

import 'keen-ui/src/bootstrap';

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app");
