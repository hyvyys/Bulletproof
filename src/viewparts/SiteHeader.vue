<template>
  <div :class="`site-header ${sticky ? 'sticky' : ''}`">
    <div class="dark">
      <div class="logo">
        <router-link
          to="/"
          class="home"
          @click.native="scrollToTop"
        >
          <SiteLogo />
        </router-link>
      </div>

      <div class="main">
        <FontLoader :gui="showFontLoader" />

        <nav class="nav nav-text-kinds">
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
        <UiButton id="language-nav-trigger">Languages</UiButton>
      </nav>
    </SigmoidContainer>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import fireEvent from "@/utils/fireEvent";
import Hamster from "hamsterjs";

import UiButton from "keen-ui/src/UiButton.vue";
import SigmoidContainer from "@/components/layout/SigmoidContainer.vue";
import FontLoader from "@/components/FontLoader.vue";
import SiteLogo from "@/components/SiteLogo.vue";

import textKinds from "@/models/textKinds";
import textKindTitle from "@/models/textKindTitle";

export default {
  components: {
    UiButton,
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
    ]),
    showFontLoader() {
      return !!this.$route.params.text;
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
    &.router-link-active {
      text-decoration: underline;
    }
  }
}
</style>
