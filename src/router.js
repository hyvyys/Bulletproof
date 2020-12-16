import Vue from "vue";
import Router from "vue-router";

import SiteHeader from "@/viewparts/SiteHeader.vue";
import SiteFooter from "@/viewparts/SiteFooter.vue";
import Home from "@/views/Home.vue";
import Help from "@/views/Help.vue";
import KerningHelp from "@/views/KerningHelp.vue";
import AnimationHelp from "@/views/AnimationHelp.vue";
import FontTester from "@/views/FontTester.vue";

import textKinds from "@/models/textKinds";

Vue.use(Router);

const router = new Router({
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
    { path: '/editor', redirect: '/custom' },
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
      path: "/help/kerning",
      name: "KerningHelp",
      components: {
        header: SiteHeader,
        main: KerningHelp,
        footer: SiteFooter,
      },
    },
    {
      path: "/help/animation",
      name: "AnimationHelp",
      components: {
        header: SiteHeader,
        main: AnimationHelp,
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


function hasQueryParams(route) {
  return !!Object.keys(route.query).length
}

router.beforeEach((to, from, next) => {
   if(!hasQueryParams(to) && hasQueryParams(from)){
    next({ ...to, query: from.query });
  } else {
    next()
  }
})

export default router;
