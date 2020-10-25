<template>
  <div class="fit-me"
    v-observe-visibility="{
      callback: visibilityChanged,
      once: true,
    }"
  >
    <div
      class="fitted"
      ref="fitted"
      :style="`font-size: ${fontSize}px;`"
    >
      {{ localText }}
    </div>
  </div>
</template>

<script>
export default {
  props: {
    text: String,
    cutText: Number,
  },
  data() {
    return {
      localText: this.text,
      fontSize: 16,
    };
  },
  methods: {
    visibilityChanged() {
      this.runFit();
    },

    async fit(i, trial = 0) {
      this.localText = this.text.slice(0, this.text.length - i);
      await this.$nextTick();

      const el = this.$refs.fitted;
      const parent = this.$el;
      let W = parent.clientWidth;
      let w = el.clientWidth;
      if (!w || !W) {
        return;
      }
      if (w === W && trial < 5) { // suspicious
        setTimeout(() => {
          this.fit(0, trial + 1);
        }, 100);
        return;
      }
      let ratio = W / w;

      let fontSize = parseFloat(getComputedStyle(el).fontSize);
      let newFontSize = Math.round(fontSize * ratio);
      this.fontSize = newFontSize;
      await this.$nextTick();

      const H = parent.clientHeight;
      const h = el.clientHeight;
      if (h / H < 0.69 && i < this.cutText) {
        await this.fit(i + 1);
      }
    },

    runFit() {
      this.fit(0);
    },
  },
};
</script>

<style lang="scss" scoped>
.fit-me {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
