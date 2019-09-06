<template>
  <div :class="`site-header ${sticky ? 'sticky' : ''}`">
    <div class="dark">
      <div class="logo">
        <router-link to="/" class="home" @click.native="scrollToTop">
          <SiteLogo />
        </router-link>
      </div>

      <div class="main">
        <FontLoader :gui="showFontLoader" />

        <nav class="nav nav-text-kinds">
          <transition-group name="fade">
            <span v-for="id in customTextIds" :key="id" class="custom-text-link">
              <router-link :to="`/custom/${id}`">Custom {{ id }}</router-link>
              <UiIconButton color="secondary" style="color: white" @click="removeCustomText(id)">
                <img svg-inline src="@/assets/icons/close.svg" key="1" />
              </UiIconButton>
            </span>
          </transition-group>

          <router-link
            v-for="kind in textKinds"
            :key="kind"
            :to="`/${kind}`"
          >{{ navlinkText(kind) }}</router-link>
        </nav>
      </div>
    </div>

    <SigmoidContainer class="light aside" sides="left" direction="bottom">
      <nav class="nav nav-aside">
        <UiIconButton id="nav-trigger">
          <div class="transition-wrapper" style="width: 24px; height: 24px;">
            <transition name="swap">
              <img
                v-if="textKind === 'custom'"
                svg-inline
                src="@/assets/icons/view_headline.svg"
                key="1"
              />
              <img
                v-else-if="textKind === 'kerning'"
                svg-inline src="@/assets/icons/kerning.svg"
                key="2"
              />
              <img
                v-else
                svg-inline
                src="@/assets/icons/playlist_add_check.svg"
                key="3"
              />
            </transition>
          </div>
        </UiIconButton>
      </nav>
    </SigmoidContainer>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import fireEvent from "@/utils/fireEvent";
import Hamster from "hamsterjs";

import UiIconButton from "keen-ui/src/UiIconButton.vue";
import SigmoidContainer from "@/components/layout/SigmoidContainer.vue";
import FontLoader from "@/components/FontLoader.vue";
import SiteLogo from "@/components/SiteLogo.vue";

import textKinds from "@/models/textKinds";
import textKindTitle from "@/models/textKindTitle";

export default {
  components: {
    UiIconButton,
    SigmoidContainer,
    SiteLogo,
    FontLoader,
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
      const key = this.selectedSampleKey;
      if (typeof key === "number") return "custom";
      else if (key === "kerning") return "kerning";
      else return "default";
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
    removeCustomText(id) {
      this.$store.commit("removeCustomText", { id });
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

  .dark {
    flex: 1;
    display: flex;
    margin-top: -8px;
    align-items: center;
  }

  .logo {
    width: $sidebar-width;
    display: flex;
    justify-content: center;
    a.home {
      text-decoration: none;
    }
  }

  .main {
    flex: 1;
    display: flex;
    align-items: center;
    padding: 0 15px;
  }
  .nav {
    padding: 0 20px;
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
    --adjust-y: 1px;
    --sigmoid-adjust: -15px;

    .nav-aside {
      padding-left: 0;
      .ui-button {
        padding: 0;
      }
    }
  }

  a {
    display: inline-block;
    color: $accent-text;
    text-decoration: none;
    margin: 0 5px;
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

.custom-text-link {
  display: inline-flex;
  align-items: center;
  a {
    margin-right: 0;
  }
  $button-size: 22px;
  .ui-icon-button {
    height: $button-size;
    width: $button-size;
    svg {
      height: $button-size;
      width: $button-size;
    }
  }
}
</style>
