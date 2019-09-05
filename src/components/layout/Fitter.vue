<template>
  <transition name="fade">
    <div class="fitter" v-show="!forceInvisible && visible">
      <div
        ref="positioned"
        class="positioned ui-popover is-raised"
        :style="`position: ${position}; width: ${width}px; top: ${top}px; max-height: ${maxHeight}px; `"
      >
        <div v-bar>
          <div
            :class="`scrolled ${disableOverscroll ? 'disable-overscroll' : ''}`"
            @wheel="onWheel"
          >
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script>
// import throttle from "lodash.throttle";
import viewport from "@/utils/viewport";

export default {
  name: "Fitter",
  props: {
    topSelector: {
      type: String,
      default: "header",
    },
    bottomSelector: {
      type: String,
      default: "footer",
    },
    scrolledParentSelector: {
      type: String,
      default: "body",
    },
    disableOverscroll: {
      type: Boolean,
      default: true,
    },
    trigger: String,
    forceInvisible: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      top: 0,
      maxHeight: null,
      position: 'fixed',
      width: null,
      visible: !this.trigger,
    };
  },
  watch: {
    $route (){
      this.updatePosition();
    },
  },
  mounted() {
    this.init();
    this.initShowHide();
  },
  destroyed() {
    this.cleanup();
  },

  methods: {
    init() {
      this.parent = document.querySelector(this.scrolledParentSelector);
      this.header = window.document.querySelector(this.topSelector);
      this.footer = window.document.querySelector(this.bottomSelector);

      this.size();
      window.addEventListener("resize", this.resize);

      if (this.header && this.footer) {
        this.updatePosition();
        this.parent.addEventListener("scroll", this.updatePosition);
        window.addEventListener("resize", this.updatePosition);
      } else {
        // eslint-disable-next-line no-console
        console.error(`Fitter didn't find element ${this.topSelector} or element ${this.bottomSelector}.`);
      }
    },
    cleanup() {
      window.removeEventListener("resize", this.resize);
      this.parent.removeEventListener("scroll", this.updatePosition);
      window.removeEventListener("resize", this.updatePosition);
    },
    updatePosition() {
      this.top = Math.max(0, this.header.getBoundingClientRect().bottom);
      this.maxHeight = Math.min(this.height, this.footer.getBoundingClientRect().top) - this.top;
      // this.position = this.top > 0 ? "static" : "fixed";
    },
    size() {
      this.height = viewport.height;
      let width = parseInt(getComputedStyle(this.$el).width);
      if (!width) {
        ({ width } = this.$refs.positioned.getBoundingClientRect());
      }
      // will be 0 if element has currently display: none
      if (width) this.width = width;
    },
    resize() {
      this.height = viewport.height;
    },
    onWheel(e) {
      if (this.disableOverscroll) {
        e.stopPropagation();
      }
    },
    initShowHide() {
      if (this.trigger) {
        document.querySelector(this.trigger).addEventListener("click", () => {
          this.toggle();
        });
        document.body.addEventListener("click", () => {
          // this.hide();
        })
      }
    },
    toggle() {
      this.visible = !this.visible;
    },
    hide() {
      this.visible = false;
    },
  },
};
</script>

<style lang="scss" scoped>
.positioned {
  display: flex;
  flex-direction: column;
  height: 100%;

  .vb {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}
.scrolled.disable-overscroll {
  overscroll-behavior: none;
  height: 100%;
}
</style>
