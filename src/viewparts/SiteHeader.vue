<template>
  <div :class="`site-header ${sticky ? 'sticky' : ''}`">
    <div class="dark main">
      <div class="logo">
        <router-link to="/" class="home" @click.native="scrollToTop">
          <SiteLogo />
        </router-link>
      </div>

      <FontLoader :gui="showFontLoader" />

      <nav class="nav nav-text-kinds">
        <EditorNav />

        <span class="nav-link" v-for="kind in textKinds" :key="kind">
          <router-link :to="`/${kind}`">{{ navlinkText(kind) }}</router-link>
        </span>
      </nav>
    </div>

    <SigmoidContainer class="light aside" sides="left" direction="bottom">
      <nav class="nav nav-aside" id="nav-trigger">
        <div class="transition-wrapper">
          <transition name="swap">
            <div v-if="!textKind" key="0" class="ui-icon-button github-icon-link-wrapper" @click.stop>
              <a class="github-icon-link"
                href="https://github.com/hyvyys/Bulletproof"
                target="_blank"
              >
                <img
                  svg-inline
                  alt="Github"
                  src="@/assets/icons/github.svg"
                />
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
import { mapGetters } from "vuex";
import fireEvent from "@/utils/fireEvent";
import Hamster from "hamsterjs";

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
  data() {
    return {
      textKinds,
      scrollDelta: 0,
      sticky: true,
    };
  },
  computed: {
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
    const deltaUp = 3;
    const deltaDown = 7;
    const scrolled = document.querySelector(this.scrolledParentSelector);
    this.scrolled = scrolled;
    const hamster = Hamster(scrolled);
    hamster.wheel((event, delta, deltaX, deltaY) => {
      if (Math.sign(deltaY) !== Math.sign(this.scrollDelta))
        this.scrollDelta = 0;
      this.scrollDelta += deltaY;
      if (this.scrollDelta > deltaUp) {
        this.sticky = true;
        setTimeout(() => fireEvent(scrolled, "scroll"), 700);
      } else if (this.scrollDelta < -deltaDown) {
        this.sticky = false;
        setTimeout(() => fireEvent(scrolled, "scroll"), 700);
      }
    });
  },
  methods: {
    navlinkText(kind) {
      return textKindTitle(kind);
    },
    scrollToTop() {
      this.scrolled.scrollTo(0, 0);
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
  z-index: 1;
  padding-top: 8px;
  @include header-background(-8px);

  position: sticky;
  top: -100%;
  transition: top 0.7s;
  &.sticky {
    top: 0;
  }

  .light {
    background: $light;
  }

  .main {
    flex: 1;
    display: flex;
    margin-top: -8px;
    align-items: center;
    min-width: 0;
  }

  .logo {
    width: $sidebar-width;
    padding: 0 15px 0 0;
    display: flex;
    justify-content: center;
    a.home {
      text-decoration: none;
    }
    flex: 0 0 auto;
  }

  .nav {
    min-width: 0;
  }
  .nav-text-kinds {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-right: 0;
    text-shadow: 0 0 15px darken($accent, 30%);
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
