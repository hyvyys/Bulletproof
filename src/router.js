import Vue from "vue";
import Router from "vue-router";

import Home from "@/views/Home.vue";
import FontTester from "@/views/FontTester.vue";
import SiteHeader from "@/viewparts/SiteHeader.vue";

import textKinds from "@/models/textKinds";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "Home",
      components: {
        header: SiteHeader,
        main: Home,
      },
    },
    {
      path: `/:text(${textKinds.join("|")}|custom/:id?)`,
      name: "FontTester",
      components: {
        header: SiteHeader,
        main: FontTester,
      },
    },
  ],
});
