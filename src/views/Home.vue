<template>
  <div class="home">
    <div class="background background-parallax">
      <div class="pane">
        <div ref="parallax" class="parallax-content" data-parallax="0.3 0">
          {{ getParallaxText() }}
        </div>
      </div>
    </div>
    <div ref="overlay" class="background background-overlay"></div>

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
import Welcome from "@/components/Welcome.vue";

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
      parallaxTexts: LanguageData.flatMap(l => l.gotchas).flatMap(g => g.tests[0]),
    };
  },
  mounted() {
    // this.setupParallax();
    this.maybeSetupParallax();
  },
  destroyed() {
    this.cleanupParallax();
  },
  methods: {
    maybeSetupParallax() {
      switch (browser && browser.name) {
        case "chrome":
          // svg shadow filter makes scrolling performance suffer in chrome
          this.$refs.overlay.classList.add("no-shadow");
          this.$el.classList.add("no-shadow");
          this.setupParallax();
          break;
        case "firefox":
          this.setupParallax();
          break;
        case "edge":
          // not yet tested
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

$pane-top-height: 800px;

.home {
  background: #333;
  &.no-shadow {
    background: #222;
  }
  z-index: 0;
  position: relative;
  overflow: hidden;

  .background {
    overflow: hidden;
    position: absolute;
    left: 50%;
    width: 100vw;
    transform: translateX(-50%);
    z-index: -1;

    &.background-overlay {
      //smaller
      $holes-width: 460px;
      $holes-x: -100px;
      $left-y: 700px;
      $right-y: -0px;

      //bigger
      $holes-width: 660px;
      $holes-x: -200px;

      // $holes-width: 55vw;
      // $holes-x: -15vw;

      $url: url("../assets/images/background-holes-bar.svg");

      @mixin bg($url, $holes-width, $holes-x) {
        $inner-x: $holes-width + $holes-x;
        $inner-width: calc(100vw - 2 * #{$inner-x});
        background: $light;
        background: #{$inner-x} 0 / #{$inner-width} linear-gradient($light, $light),
          left #{$holes-x} top #{$left-y} / #{$holes-width} #{$url},
          right #{$holes-x} top #{$right-y} / #{$holes-width} #{$url};
        background-repeat: repeat-y;
      }

      @include bg($url, $holes-width, $holes-x);

      &.no-shadow {
        $url: url("../assets/images/background-holes-bar-no-shadow.svg");
        @include bg($url, $holes-width, $holes-x);
      }

      top: 0;
      bottom: 0;
      // opacity: 0;
    }

    &.background-parallax {
      font-family: Rywalka;
      font-size: 2vw;
      line-height: 1.2;
      top: -1.2em;
      width: 110vw;
      height: 100%;
      color: #fff;
      opacity: 0;
      @include fade-in(fade-in-1, $duration: 0.3s, $to: 0.5);

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
</style>
