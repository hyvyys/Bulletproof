<template>
  <div class="fitter" :style="`min-width: ${width}px`">
    <div
      ref="positioned"
      class="positioned"
      :style="`position: ${position}; width: ${width}px; top: ${top}px; max-height: ${maxHeight}px; `"
    >
      <div v-bar class="scrolled">
        <div>
          <slot></slot>
        </div>
      </div>
    </div>
  </div>
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
  },
  data() {
    return {
      top: 0,
      maxHeight: null,
      position: 'fixed',
      width: null,
    };
  },
  mounted() {
    this.parent = document.querySelector(this.scrolledParentSelector);
    this.header = window.document.querySelector(this.topSelector);
    this.footer = window.document.querySelector(this.bottomSelector);

    this.resize();
    const throttledResize = this.resize; //throttle(this.resize, 1000 / 120, { leading: true });
    window.addEventListener("resize", throttledResize);

    if (this.header && this.footer) {
      this.updatePosition();
      const throttled = this.updatePosition;
      // const throttled = throttle(this.updatePosition, 1, { leading: true });
      this.parent.addEventListener("scroll", throttled);
      window.addEventListener("resize", throttled);
    } else {
      // eslint-disable-next-line no-console
      console.error(`Fitter didn't find element ${this.topSelector} or element ${this.bottomSelector}.`);
    }
  },

  methods: {
    updatePosition() {
      console.log('pos')
      this.top = Math.max(0, this.header.getBoundingClientRect().bottom);
      this.maxHeight = Math.min(this.height, this.footer.getBoundingClientRect().top) - this.top;
      // this.position = this.top > 0 ? "static" : "fixed";
    },
    resize() {
      this.height = viewport.height;
      let width = parseInt(getComputedStyle(this.$el).width);
      if (!width) {
        ({ width } = this.$refs.positioned.getBoundingClientRect());
      }
      // will be 0 if element has currently display: none
      if (width) this.width = width;
    },
  },
};
</script>

<style lang="scss" scoped>
.positioned {
  display: flex;
  flex-direction: column;
}
.scrolled {
  margin: 0px;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
}
</style>
