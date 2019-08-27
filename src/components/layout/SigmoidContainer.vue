<template>
  <div :class="`sigmoid-container ${sides} ${direction}`">
    <svg style="display: block;" height="0" width="0">
      <defs>
        <clipPath id="sigmoid-right" clipPathUnits="objectBoundingBox">
          <path :d="path" />
        </clipPath>
        <clipPath id="sigmoid-left" clipPathUnits="objectBoundingBox">
          <path transform="translate(1 0) scale(-1 1)" :d="path" />
        </clipPath>
        <clipPath id="sigmoid-right-bottom" clipPathUnits="objectBoundingBox">
          <path :d="pathRB" />
        </clipPath>
        <clipPath id="sigmoid-left-bottom" clipPathUnits="objectBoundingBox">
          <path transform="translate(1 1) scale(-1 -1)" :d="path" />
        </clipPath>
      </defs>
    </svg>
    <div class="content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "SigmoidContainer",
  props: {
    waviness: { type: Number, default: 0.6 },
    sides: { type: String, default: "both" },
    direction: { type: String, default: "top" },
  },
  computed: {
    control() {
      return Math.min(Math.max(0, this.waviness), 1);
    },
    path() {
      return `M0,1 C${this.control * 1},1 ${(1 - this.control) * 1},0 1,0 L0,0 0,1`;
    },
    pathRB() {
      return `M0,0 C${this.control * 1},0 ${(1 - this.control) * 1},1 1,1 L0,1 0,0`;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/mixins.scss";

.sigmoid-container {
  $width: 45px;
  $margin-adjust: -10px;

  --sigmoid-width: 45px;
  --sigmoid-adjust: -10px;
  &.large {
    --sigmoid-width: 95px;
    --sigmoid-adjust: -40px;
  }

  $width: var(--sigmoid-width);
  $margin-adjust: var(--sigmoid-adjust);
  $margin: calc(#{$width} + #{$margin-adjust});

  --adjust-x: 1px;
  --adjust-y: 0px;
  $chrome-correction-x: 1px;
  $chrome-correction-x: var(--adjust-x);
  $chrome-correction-y: 0px;
  $chrome-correction-y: var(--adjust-y);

  position: relative;

  .content {
    height: 100%;
    width: calc(100% - #{$margin-adjust});
    display: flex;
    align-items: center;
    opacity: 0.9999;
    z-index: 1;
  }

  &.left,
  &.both {
    margin-left: $margin;
    &::before {
      @include pseudo-border();
      height: calc(100% + #{$chrome-correction-y});
      width: $width;
      right: 100%;
      right: calc(100% - #{$chrome-correction-x});
    }
    &.top::before {
      clip-path: url("#sigmoid-left");
      top: calc(-1 * #{$chrome-correction-y});
    }
    &.bottom::before {
      clip-path: url("#sigmoid-left-bottom");
      top: 0;
    }
    .content {
      margin-left: $margin-adjust;
    }
  }
  &.right,
  &.both {
    margin-right: $margin;
    &::after {
      @include pseudo-border();
      display: block;
      width: $width;
      left: 100%;
      left: calc(100% - #{$chrome-correction-x});
      height: calc(100% + #{$chrome-correction-y});
    }
    &.top::after {
      clip-path: url("#sigmoid-right");
      top: calc(-1 * #{$chrome-correction-y});
    }
    &.bottom::after {
      clip-path: url("#sigmoid-right-bottom");
      top: 0;
    }
    .content {
      margin-right: $margin-adjust;
    }
  }
  &.both {
    .content {
      width: calc(100% - 2 * #{$margin-adjust});
    }
  }
}
</style>
