<template>
  <div class="sigmoid-container" :style="rootStyle">
    <svg style="display: block;" height="0" width="0" preserveAspectRatio="none">
      <defs>
        <clipPath :id="svgLeftId" clipPathUnits="objectBoundingBox">
          <path :d="path('left')" />
        </clipPath>
        <clipPath :id="svgRightId" clipPathUnits="objectBoundingBox">
          <path :d="path('right')" />
        </clipPath>
      </defs>
    </svg>

    <div
      v-if="left"
      class="sigmoid left"
      :style="sigmoidWrapperStyle('left')"
    >
      <div :style="sigmoidStyle('left')"/>
    </div>
    <div class="container" :style="containerStyle">
      <div class="content" :style="contentStyle">
        <slot></slot>
      </div>
    </div>
    <div
      v-if="right"
      class="sigmoid right"
      :style="sigmoidWrapperStyle('right')"
    >
      <div :style="sigmoidStyle('right')"/>
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
        // opacity: 0.9999;
        z-index: 1;
      `;
    },
  },
  mounted() {
    const style = getComputedStyle(this.$el);
    // console.log(this.$el.style.background , style.backgroundImage ,style.backgroundColor)
    // TODO: adjust background position
    this.background = this.$el.style.background || style.backgroundImage + ' ' + style.backgroundColor;
  },
  methods: {
    path(side) {
      return this.top ?
      (
        side === 'left'
        ? `M0,1 C${this.control * 1},1 ${(1 - this.control) * 1},0 1,0 L1,1 0,1`
        : `M0,0 C${this.control * 1},0 ${(1 - this.control) * 1},1 1,1 L0,1 0,0`
      ) : (
        side === 'left'
        ? `M0,0 C${this.control * 1},0 ${(1 - this.control) * 1},1 1,1 L1,0 0,0`
        : `M0,1 C${this.control * 1},1 ${(1 - this.control) * 1},0 1,0 L0,0 0,1`
      );
    },
    sigmoidWrapperStyle(side) {
      return `
        position: absolute;
        top: 0;
        bottom: 0;
        width: ${this.width}px;
        ${side === 'left' ? `
          right: 100%;
        ` : `
          left: 100%;
        `}
        overflow: hidden;
      `;

    },
    sigmoidStyle(side) {
      return `
        background: ${this.background};
        height: calc(100% + 0.5px) /* fixes gap left by imprecise clip-path */;
        ${ this.top ? "" : "transform: translateY(-0.5px);" }
        width: calc(100% + 0.5px) /* fixes gap left by imprecise clip-path */;
        ${side === 'left' ? `
          clip-path: url('#${this.svgLeftId}');
        ` : `
          clip-path: url('#${this.svgRightId}');
        `}
      `;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/mixins.scss";
</style>
