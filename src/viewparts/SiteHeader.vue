<template>
  <div :class="`site-header ${!footerVisible && sticky ? 'sticky' : ''}`">
    <transition-group tag="div" class="above-sidebar slide-left-wrapper" :name="aboveHeaderTransition">
      <div key="button" v-if="!!textKind" class="settings-aside-wrap">
        <SigmoidContainer id="settings-trigger" class="settings-aside light" sides="right top">
          <nav class="nav nav-aside" @click="toggleSettingsPanel">
            <div class="transition-wrapper">
              <UiIconButton>
                <img svg-inline src="@/assets/icons/view_headline.svg" />
              </UiIconButton>
            </div>
          </nav>
        </SigmoidContainer>
      </div>

      <div key="logo" class="logo">
        <router-link to="/" class="home" @click.native="scrollToTop">
          <SiteLogo />
        </router-link>
      </div>
    </transition-group>

    <div class="logo-top" :class="{ 'alone': !isTesterPage }">
        <router-link to="/" class="home" @click.native="scrollToTop">
          <SiteLogo />
        </router-link>
    </div>

    <div class="dark main">

      <UiButton v-if="isTesterPage" class="collapse-mobile-trigger left" @click="expandMenu('fontMenu')">{{ selectedFont && selectedFont.family ? selectedFont.family : 'Font' }}</UiButton>
      <div class="collapse-mobile" :class="{ expanded: expandedMenu === 'fontMenu' }">
        <FontLoader :gui="isTesterPage" />
        <TextTools v-if="isTesterPage" />
      </div>

      <UiButton v-if="isTesterPage" class="collapse-mobile-trigger right" @click="expandMenu('navMenu')">{{ textKind || 'Begin' }}</UiButton>
      <div class="collapse-mobile nav-menu" :class="{ expanded: expandedMenu === 'navMenu' }">
          <nav class="nav nav-text-kinds">
            <EditorNav @navigated="expandMenu(null)" />
            <span class="nav-link" v-for="kind in textKinds" :key="kind">
              <router-link @click.native="expandMenu(null)" :to="`/${kind}`">{{ navlinkText(kind) }}</router-link>
            </span>
          </nav>
      </div>

    </div>

    <SigmoidContainer id="nav-trigger" class="light aside right-wrapper" sides="left top">
      <nav class="nav nav-aside" @click="toggleContextualPanel">
        <div class="transition-wrapper">
          <transition name="swap">
            <div
              v-if="!textKind"
              key="0"
              class="ui-icon-button github-icon-link-wrapper"
              @click.stop
            >
              <a
                class="github-icon-link"
                href="https://github.com/hyvyys/Bulletproof"
                target="_blank" rel="noopener noreferrer"
              >
                <img svg-inline alt="Github" src="@/assets/icons/github.svg" />
              </a>
            </div>
            <UiIconButton v-else-if="textKind === 'custom'" key="1">
              <img svg-inline src="@/assets/icons/view_headline.svg" />
            </UiIconButton>
            <UiIconButton v-else-if="textKind === 'kerning'" key="2">
              <img svg-inline src="@/assets/icons/kerning.svg" />
            </UiIconButton>
            <UiIconButton v-else key="3">
              <img svg-inline src="@/assets/icons/playlist_add_check.svg" />
            </UiIconButton>
          </transition>
        </div>
      </nav>
    </SigmoidContainer>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import viewport from "@/utils/viewport";

import FontLoader from "@/components/FontLoader.vue";
import EditorNav from "@/components/EditorNav.vue";
import TextTools from "@/components/TextTools.vue";
import SiteLogo from "@/components/SiteLogo.vue";
import SigmoidContainer from "@/components/layout/SigmoidContainer.vue";
import UiButton from "keen-ui/src/UiButton.vue";
import UiIconButton from "keen-ui/src/UiIconButton.vue";
import UiPopover from "keen-ui/src/UiPopover.vue";
import UiCollapsible from "keen-ui/src/UiCollapsible.vue";

import textKinds from "@/models/textKinds";
import textKindTitle from "@/models/textKindTitle";

export default {
  components: {
    FontLoader,
    EditorNav,
    TextTools,
    SiteLogo,
    SigmoidContainer,
    UiButton,
    UiIconButton,
    UiPopover,
    UiCollapsible,
  },
  props: {
    hideHeaderOnScroll: { type: Boolean, default: false },
  },
  data() {
    return {
      textKinds,
      aboveHeaderTransition: "slide-left",
      scrolledParent: null,
      stickyShowDelta: 200, // px
      stickyHideDelta: 300, // px
      lastTop: 0,
    };
  },
  computed: {
    ...mapState({
      sticky: state => state.layout.sticky,
      footerVisible: state => state.layout.footerVisible,
    }),
    ...mapState([
      "expandedMenu",
      "isMobile",
    ]),
    ...mapGetters([
      "scrolledParentSelector",
      "customTextIds",
      "selectedSampleKey",
      "selectedFont",
    ]),
    isTesterPage() {
      return !!this.$route.params.text;
    },
    textKind() {
      return this.$route.params.text;
    },
  },
  mounted() {
    // duct tape to avoid erroneous transition up/down when clicking a hash anchor
    window.addEventListener("resize", this.setAboveHeaderTransition);
    this.setAboveHeaderTransition();
    this.scrolledParent = document.querySelector(this.scrolledParentSelector);
    // if (this.hideHeaderOnScroll)
      // this.initStickyHeader();
  },
  methods: {
    expandMenu(menuId) {
      this.$store.commit("expandMenu", { menuId });
    },
    setSticky(value) {
      this.$store.commit("sticky", { value });
    },
    setAboveHeaderTransition() {
      this.aboveHeaderTransition = viewport.height < 500 ? "" : "slide-left";
    },
    navlinkText(kind) {
      return textKindTitle(kind);
    },
    scrollToTop() {
      this.scrolledParent.scrollTo(0, 0);
      this.expandMenu(null);
    },
    toggleSettingsPanel() {
      this.expandMenu(null);
      if (this.isMobile) {
        this.$store.commit("toggleContextualPanel", { value: false });
      }
      this.$store.commit("toggleSettingsPanel");
    },
    toggleContextualPanel() {
      this.expandMenu(null);
      if (this.isMobile) {
        this.$store.commit("toggleSettingsPanel", { value: false });
      }
      this.$store.commit("toggleContextualPanel");
    },

    measureTop() {
      const el = this.scrolledParent === window ? document.documentElement : this.scrolledParent;
      const top = el.scrollTop;
      return top;
    },

    hasScrolled() {
      const top = this.measureTop();
      const delta = top - this.lastTop;
      if (-delta > this.stickyShowDelta || top < 100) {
        this.setSticky(true);
        this.lastTop = top;
      }
      else if (delta > this.stickyHideDelta) {
        this.setSticky(false);
        this.lastTop = top;
      }
    },

    initStickyHeader() {
      let didScroll = false;

      this.scrolledParent.addEventListener("wheel", () => didScroll = true);
      this.scrolledParent.addEventListener("click", () => this.lastTop = this.measureTop());
      setInterval(() => {
        if (didScroll) {
          this.hasScrolled();
          didScroll = false;
        }
      }, 250);
    },
  },
};
</script>

<style lang="scss">
@import "@/scss/variables.scss";
@import "@/scss/sigmoid-border";
@import "@/scss/super-gradient.scss";

$header-background: linear-gradient(to right, $light, $accent);

@mixin header-background($top: 0) {
  background: $accent;
  // @include gradient-red();
  background: linear-gradient(-90deg, $dark-brown, $accent-faded);
  // background-position: 0 $top;
  // background-size: 100vw 150px;
}

.site-header {
  // position: relative;
  display: flex;
  align-items: stretch;
  justify-items: space-between;
  padding-top: 8px;
  @include header-background(-8px);

  z-index: 5;
  position: sticky;
  top: 0;
  transition: transform 0.2s;

  height: $header-height;
  &:not(.sticky) {
    transform: translateY(-$header-height);
  }

  @media screen and (max-width: $mq-max-width) {
    height: $header-height-mq;
    &:not(.sticky) {
      transform: translateY(-$header-height-mq);
    }
  }

  .light {
    background: $light;
  }

  .main {
    margin-top: -4px;
    flex: 1;
    display: flex;
    align-items: center;
    min-width: 0;
    // flex-wrap: wrap-reverse;
  }

  .above-sidebar {
    @media (min-width: 1000px) {
    width: $sidebar-width;
    }
    display: flex;
  }

  .logo {
    margin-top: -4px;
    display: flex;
    justify-content: center;
    flex: 0 0 auto;
  }
  .logo, .logo-top {
    a.home {
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .nav {
    min-width: 0;
  }

  .font-loader {
    flex: 0 1 15em;
  }
  .text-tools {
    flex-shrink: 0;
  }

  .settings-aside-wrap {
    display: flex;
  }

  .settings-aside {
    --adjust-y: 1px;
    --sigmoid-adjust: -15px;

    .nav-aside {
      padding-left: 0;
      .ui-button {
        padding: 0;
      }
    }
  }

  .aside {
    padding-right: $vuebar-width;
    padding-right: 14px;
    --adjust-y: 1px;
    --sigmoid-adjust: -15px;

    .nav-aside {
      padding-left: 0;
      .ui-button {
        padding: 0;
      }
    }
  }

  .nav-link {
    margin: 0 5px;
    a {
      display: inline-block;
      color: $accent-text;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
      font-size: 1.1em;
      font-weight: 500;
      // transition: transform 0.2s;

      transform: scale(0.95);
      // will-change: transform;
      -webkit-font-smoothing: antialiased;

      &.router-link-active {
        text-decoration: underline;
        transform: scale(1);
      }
    }
  }

  .nav-text-kinds {
    // min-width: 250px;
    // flex: 1 0 auto;
    flex: 1 2 48em;
    flex-wrap: wrap;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0;
    text-shadow: 0 0 15px darken($accent, 30%);

    > :last-child {
      margin-right: 0.75em;
    }
  }

  .collapse-mobile {
    display: flex;
    align-items: center;
    &.nav-menu {
      flex: 1;
    }
  }
  .collapse-mobile-trigger {
    display: none;
    overflow: hidden;
    padding: 2px;
    > div {
      white-space: nowrap;
      text-overflow: ellipsis;
      width: 100%;
      display: block;
      overflow: hidden;
    }
  }

  .logo-top {
    display: none;
  }
  @media (max-width: 1400px) {
      .slide-left-wrapper {
        width: unset;
      }
      .site-logo {
        margin: 0;
        font-size: 18px;
        justify-content: center;
        padding-right: .5em;
        .weak {
          display: none;
        }
      }
      .logo {
        height: 100%;
        padding-right: .2em;
        margin-top: -2px;
      }
  }

  @media (max-width: 1000px) {
    .logo {
      margin-left: 0;
      height: 1.5em;
    }
    .logo-top {
      display: block;
      grid-area: top;
      margin: -5px 0 -25px;
      &.alone {
        padding-left: 51px;
      }
    }

    display: grid;
    grid-template-areas:  "left top right" "left bottom right";
    grid-template-columns: auto 1fr auto;

    .slide-left-wrapper {
      grid-area: left;
      .logo {
        display: none;
      }
    }
    .right-wrapper {
      grid-area: right;
    }
    .main {
      grid-area: bottom;
      justify-content: center;
      margin: 0 -10px;
    }
    .font-loader {
      flex-basis: 25em;
    }

    .collapse-mobile {
      align-items: flex-start;
      background: #eee;
      padding: .8rem .6rem;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      &.nav-menu {
        height: calc(100vh - #{ $header-height });
      }
      overflow: auto;
      transform-origin: 50% 0%;
      transform: scaleY(0);
      // transition: transform .3s;
      > * {
        opacity: 0;
        // transition: opacity .15s;
      }
      &.expanded {
        transform: none;
        > * {
          opacity: 1;
        }
      }
    }
    .collapse-mobile-trigger.ui-button {
      display: block;
      font-size: 11px;
      flex: 1 0 50%;
      margin: 0;
      height: 100% !important;
      border-radius: 0 .8rem 0 0;
      padding-left: 10px;
      &.right {
        border-radius: .8rem 0 0 0;
        padding-right: 10px;
        padding-left: 0;
      }
      background: transparent;
      color: white;
      &:hover {
        background: transparent;
        color: white;
      }
    }

    .nav-text-kinds {
      justify-content: flex-start;
      > :last-child {
        margin: 0;
      }
    }

    .nav-link {
      flex: 0 0 50%;
      margin: 0;
      text-shadow: none;
      padding: 5px;
      a {
        padding: .6rem;
        color: black;
        display: block;
        border: 1px solid #333;
        border-radius: 3px;
        text-align: center;
        transform: scale(1);
        &.router-link-active {
          background: rgba(34, 17, 17, 0.8);
          box-shadow: inset 0 0 5px #000;
          color: white;
          text-decoration: none;
        }
      }
    }

    .editor-nav {
      flex: 0 0 100%;
      flex-wrap: wrap;

      .nav-link {
        display: flex;
        a {
          flex: 1;
        }
      }
      .nav-link.new {
        flex: 0 0 50% !important;
        flex: 0 0 50% !important;
      }
      // display: block;

      .ui-icon-button {
        color: black !important;
        width: 32px;
        height: 32px;
        margin-bottom: 2px;
        margin-left: 2px;
      }
    }
  }
}

.github-icon-link-wrapper {
  cursor: pointer;
  display: flex; // saves the day! (if it comes to transitions)
  a {
    display: flex;
    svg {
      width: 32px;
      height: 32px;
      margin: 2px;
    }
  }
}

</style>
