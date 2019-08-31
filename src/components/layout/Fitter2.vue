<template>
  <div class="fitter" v-bar :style="`top: ${top}px; bottom: ${bottom}px`">
    <div class="scrolled">
      <slot></slot>
    </div>
  </div>
</template>

<script>
import throttle from "lodash.throttle";
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
      bottom: null,
      width: null,
    };
  },
  mounted() {
    const throttledPosition = throttle(this.position, 1000 / 60, { leading: true });
    const parent = document.querySelector(this.scrolledParentSelector);
    parent.addEventListener("scroll", throttledPosition);
    window.addEventListener("resize", throttledPosition);
    this.position();
  },
  methods: {
    position() {
      // const header = window.document.querySelector(this.topSelector);
      // if (header) {
      //   const { bottom } = header.getBoundingClientRect();
      //   this.top = Math.max(0, bottom);
      // } else {
      //   console.error(`Fitter didn't find element ${this.topSelector}.`);
      // }

      // const footer = window.document.querySelector(this.bottomSelector);
      // if (footer) {
      //   const { top } = footer.getBoundingClientRect();
      //   this.bottom = Math.max(0, viewport.height - top);
      // } else {
      //   console.error(`Fitter didn't find element ${this.bottomSelector}.`);
      // }
    },
  },
};
</script>

<style lang="scss" scoped>
.fitter {
  // position: sticky;
  // top: 0;
  // align-self: flex-start;
}
</style>
