import Vue from "vue";
import Router from "vue-router";

import SiteHeader from "@/viewparts/SiteHeader.vue";
import SiteFooter from "@/viewparts/SiteFooter.vue";

import Home from "@/views/Home.vue";
import Help from "@/views/Help.vue";
import FontTester from "@/views/FontTester.vue";

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
        footer: SiteFooter,
      },
    },
    {
      // parentheses enclose text kind RegExp
      path: `/:text(${textKinds.join("|")}|custom)/:id?`,
      name: "FontTester",
      components: {
        header: SiteHeader,
        main: FontTester,
        footer: SiteFooter,
      },
    },
    {
      path: "/help",
      name: "Help",
      components: {
        header: SiteHeader,
        main: Help,
        footer: SiteFooter,
      },
    },
  ],
});
