<template>
  <div class="home" :class="{webkit, safari, loaded }">
    <div class="background background-parallax" :class="{webkit, safari, loaded }">
      <div class="pane">
        <div ref="parallax" class="parallax-content" data-parallax="0.3 0">
          {{ getParallaxText() }}
        </div>
      </div>
    </div>
    <div ref="overlay" class="background background-overlay" :class="{webkit, safari, loaded }"></div>

    <Welcome msg="Welcome to Your Vue.js App" />
  </div>
</template>

<script>
// import debounce from "lodash.debounce";
// import throttle from "lodash.throttle";
const { detect } = require("detect-browser");
const browser = detect();

import { mapGetters } from "vuex";

import shuffle from "@/models/shuffle";
import LanguageData from "language-data";
import Welcome from "@/views/Welcome.vue";

export default {
  name: "Home",
  components: {
    Welcome,
  },
  computed: {
    ...mapGetters(["scrolledParentSelector"]),
  },
  data() {
    return {
      loaded: false,
      parallaxTexts: LanguageData.flatMap(l => l.gotchas).flatMap(g => g.tests[0]),
      webkit: false,
      safari: false,
    };
  },
  mounted() {
    // this.setupParallax();
    this.maybeSetupParallax();
    setTimeout(() => {
      this.loaded = true;
    }, 200);
  },
  destroyed() {
    this.cleanupParallax();
  },
  methods: {
    maybeSetupParallax() {
      switch (browser && browser.name) {
        case "chrome":
          // svg shadow filter makes scrolling performance suffer in chrome
          this.webkit = true;
          this.setupParallax();
          break;
        case "firefox":
          this.setupParallax();
          break;
        case "edge":
          // not yet tested
          break;
        case "safari":
          this.safari = true;
          break;
        case "ios":
          this.safari = true;
          break;
        default:
          break;
      }
    },
    setupParallax() {
      this.scrolledParent = document.querySelector(this.scrolledParentSelector);
      this.parallaxes = [this.$refs.parallax];
      this.scrolledParent.addEventListener("scroll", this.moveParallax);
    },
    cleanupParallax() {
      this.scrolledParent.removeEventListener("scroll", this.moveParallax);
    },
    getParallaxText() {
      return shuffle(this.parallaxTexts)
        .join(" ")
        .repeat(30);
    },
    moveParallax() {
      let top = this.scrolledParent.scrollTop;
      this.parallaxes.forEach(parallax => {
        const params = parallax.dataset.parallax.split(" ");
        const y = top * params[0];
        parallax.style.transform = `translateY(${y}px)`;
      });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/variables";
@import "@/scss/mixins";

$solid-bg-width: 600px;
$holes-width: 500px;

@mixin bg-holes($side: left, $y: 0px, $url: url("../assets/images/background-holes-bar.svg")) {
  background: #{$url};
  background-position: 0 #{$y};
  background-size: 100% auto;
  // $d: 10px;
  // @return
  // $side 0 top #{$y + .5 * $d} / 100% 100% linear-gradient(0deg, #f00, #f00 $d, transparent $d + 1px, transparent),
  // $side 0 top #{$y} / cover #{$url},
  // ;
}

.home {
  flex: 1;
  padding: 0 80px;
  @media (max-width: 1000px) {
    padding: 0 7.5vw;
  }
  z-index: 0;
  position: relative;
  overflow: hidden;

  .background {
    position: absolute;
    width: 100vw;
    left: 50%;
    transform: translateX(-50%); // also creates new stacking context
    z-index: -1;

    &.safari {
      display: none;
    }
    @media (max-width: 1000px) {
      display: none;
    }

    &:not(.safari) {
      &.background-overlay {
        background: $light;
        top: 0;
        bottom: 0;
        &.loaded {
          width: $solid-bg-width;
        }

        @include pseudo;
        position: absolute; // positioned thanks to transform creating new stacking context
        &::before {
          left: 2px;
          transform: translateX(-100%);
        }
        &::after {
          left: calc(100% - 2px);
        }

        $left-y: -110vh;
        $left-y: -1500px;
        $right-y: 0;
        $url: url("../assets/images/background-holes-bar.svg");
        &::before {
          @include bg-holes(right, $left-y, $url);
        }
        &::after {
          @include bg-holes(left, $right-y, $url);
        }

        &.webkit {
          $url: url("../assets/images/background-holes-bar-webkit.svg");
          &::before {
            @include bg-holes(right, $left-y, $url);
          }
          &::after {
            @include bg-holes(left, $right-y, $url);
          }
        }

        &::before,
        &::after {
          width: calc((110vw - #{$solid-bg-width}) / 2 + 10px);
          @media screen and (min-width: 1420px) {
            width: calc(#{$holes-width} + 10px);
          }
          // background-repeat: repeat-y repeat-y;
          background-repeat: repeat-y;
        }
      }

      &.background-parallax {
        font-family: "Rywalka Bulletproof";
        font-size: 1.8rem;
        @media screen and (max-width: 1000px) {
          font-size: 2vw;
        }
        line-height: 1.2;
        top: -1.2em;
        bottom: -1.2em;
        width: $solid-bg-width + 2 * $holes-width - 5px;
        background: #333;
        &.webkit {
          background: #222;
        }
        color: #bbb;

        opacity: 0;
        &.loaded {
          // opacity: 1;
          @include fade-in(fade-in-1, $duration: 0.3s, $to: 1);
        }

        .pane {
          text-align: center;
          overflow: hidden;
          .parallax-content {
            // transition: transform 0.2s;
          }
        }
      }
    }
  }
}
</style>
