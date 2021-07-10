<template>
  <div class="sigmoid-container" :style="rootStyle">
    <div
      v-if="left"
      class="sigmoid left"
      :style="sigmoidWrapperStyle"
    >
      <div :style="sigmoidStyle"/>
    </div>

    <div class="container" :style="containerStyle">
      <div class="content" :style="contentStyle">
        <slot></slot>
      </div>
    </div>

    <div
      v-if="right"
      class="sigmoid right"
      :style="sigmoidWrapperStyle"
    >
      <div :style="sigmoidStyle"/>
    </div>
  </div>
</template>

<script>
import getId from "@/utils/id";

export default {
  name: "SigmoidContainer",
  props: {
    waviness: { type: Number, default: 0.6 },
    sides: { type: String, default: "both top" },
    width: { type: String, default: "45" },
    marginAdjust: { type: Number, default: 15 },
  },
  data() {
    return {
      svgLeftId: getId(),
      svgRightId: getId(),
      background: "",
    };
  },
  computed: {
    control() {
      return Math.min(Math.max(0, this.waviness), 1);
    },
    sidesArray() {
      return this.sides.split(" ");
    },
    top() {
      return this.sidesArray.indexOf("top") > -1;
    },
    left() {
      return this.sidesArray.indexOf("both") > -1
        || this.sidesArray.indexOf("left") > -1;
    },
    right() {
      return this.sidesArray.indexOf("both") > -1
        || this.sidesArray.indexOf("right") > -1;
    },
    rootStyle() {
      return `
        ${this.left ? `margin-left: ${this.width - this.marginAdjust}px;` : ''}
        ${this.right ? `margin-right: ${this.width - this.marginAdjust}px;` : ''}
        position: relative;
      `;
    },
    containerStyle() {
      return `
        height: 100%;
        display: flex;
        align-items: center;
      `;
    },
    contentStyle() {
      return `
        ${this.left ? `margin-left: -${this.marginAdjust}px;` : ''}
        ${this.right ? `margin-right: -${this.marginAdjust}px;` : ''}
        z-index: 1;
      `;
    },
    sigmoidWrapperStyle() {
      return `
        width: ${this.width}px;
      `;
    },
    sigmoidStyle() {
      return `
        background: ${this.background};
        ${!this.top ? 'transform: translateY(-1px) scaleY(-1);' : ''}
      `;
    },
  },
  mounted() {
    const style = getComputedStyle(this.$el);
    this.background = this.$el.style.background || style.backgroundImage + ' ' + style.backgroundColor;
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/mixins.scss";

.sigmoid {
  overflow: hidden;
  position: absolute;
  top: 0;
  bottom: 0;
  &.left {
    right: calc(100% - 0.5px);
  }
  &.right {
    left: calc(100% - 0.5px);
  }
  > div {
    height: calc(100% + .5px) /* fixes gap left by imprecise clip-path */;
    width: calc(100% + .5px) /* fixes gap left by imprecise clip-path */;
    mask: url('../../assets/images/sigmoid.svg');
    mask-size: 101% 101%;
  }
  &.right {
    transform: scaleX(-1);
  }
}
</style>
