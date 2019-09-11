<template>
  <svg style="display: block;" height="0" width="0" preserveAspectRatio="none">
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
</template>

<script>
export default {
  name: "SigmoidDefs",
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
