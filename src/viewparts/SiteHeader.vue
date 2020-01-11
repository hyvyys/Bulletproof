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

    <div class="dark main">
      <FontLoader :gui="showFontLoader" />

      <nav class="nav nav-text-kinds">
        <EditorNav />
        <span class="nav-link" v-for="kind in textKinds" :key="kind">
          <router-link :to="`/${kind}`">{{ navlinkText(kind) }}</router-link>
        </span>
      </nav>
    </div>

    <SigmoidContainer id="nav-trigger" class="light aside" sides="left top">
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
import SiteLogo from "@/components/SiteLogo.vue";
import SigmoidContainer from "@/components/layout/SigmoidContainer.vue";
import UiIconButton from "keen-ui/src/UiIconButton.vue";

import textKinds from "@/models/textKinds";
import textKindTitle from "@/models/textKindTitle";

export default {
  components: {
    FontLoader,
    EditorNav,
    SiteLogo,
    SigmoidContainer,
    UiIconButton,
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
    ...mapGetters([
      "scrolledParentSelector",
      "customTextIds",
      "selectedSampleKey",
    ]),
    showFontLoader() {
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
    if (this.hideHeaderOnScroll)
      this.initStickyHeader();
  },
  methods: {
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
    },
    toggleSettingsPanel() {
      this.$store.commit("toggleSettingsPanel");
    },
    toggleContextualPanel() {
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

<style lang="scss" scoped>
@import "@/scss/variables.scss";
@import "@/scss/sigmoid-border";
@import "@/scss/super-gradient.scss";

$header-background: linear-gradient(to right, $light, $accent);

@mixin header-background($top: 0) {
  background: $accent;
  @include gradient-red;
  background-position: 0 $top;
  background-size: 100vw 150px;
}

.site-header {
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
    width: $sidebar-width;
    display: flex;
  }

  .logo {
    margin-top: -4px;
    padding: 0 15px 0 0;
    display: flex;
    justify-content: center;
    a.home {
      text-decoration: none;
      display: flex;
      align-items: center;
    }
    flex: 0 0 auto;
  }

  .nav {
    min-width: 0;
  }

  .font-loader {
    flex: 0 1 15em;
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
    --adjust-y: 1px;
    --sigmoid-adjust: -15px;

    .nav-aside {
      padding-left: 0;
      .ui-button {
        padding: 0;
      }
    }
  }

  ::v-deep .nav-link {
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
