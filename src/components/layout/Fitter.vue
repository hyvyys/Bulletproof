<template>
  <div class="fitter" :style="`min-width: ${width}px`">
    <div
      ref="positioned"
      class="positioned"
      :style="`width: ${width}px; top: ${top}px; bottom: ${bottom}px`"
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
import throttle from "lodash.throttle";

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
      bottom: null,
      width: null,
    };
  },
  mounted() {
    const throttledPosition = throttle(this.position, 1000 / 120, { leading: true });
    const parent = document.querySelector(this.scrolledParentSelector);
    parent.addEventListener("scroll", throttledPosition);
    window.addEventListener("resize", throttledPosition);
    this.position();
  },
  methods: {
    position() {
      const viewportHeight = Math.max(
        document.documentElement.clientHeight,
        window.innerHeight || 0
      );

      const header = window.document.querySelector(this.topSelector);
      if (header) {
        const { bottom } = header.getBoundingClientRect();
        this.top = Math.max(0, bottom);
      } else {
        console.error(`Fitter didn't find element ${this.topSelector}.`);
      }

      const footer = window.document.querySelector(this.bottomSelector);
      if (footer) {
        const { top } = footer.getBoundingClientRect();
        this.bottom = Math.max(0, viewportHeight - top);
      } else {
        console.error(`Fitter didn't find element ${this.bottomSelector}.`);
      }

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
  position: absolute;
}
.scrolled {
  height: 100%;
  overflow-y: scroll;
  display: flex;
  flex-direction: column;
}
</style>
