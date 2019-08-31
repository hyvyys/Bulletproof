<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="font-sample">
    <div
      class="font-sample-content"
      contenteditable
      spellcheck="false"
      :style="`
        font-family: ${selectedFont.family}, ${settings.fallbackFontFamily};
        font-weight: ${selectedFont.cssWeight};
        font-style: ${selectedFont.cssStyle};
        font-size: ${settings.fontSize}${settings.fontSizeUnit}
      `"
      @input="onInput"
      v-html="html"
    />
  </div>
</template>

<script>
import settings from "@/models/settings";
import { mapGetters } from "vuex";

export default {
  name: "FontSample",
  props: {
    html: {
      type: String,
      default: "",
    },
    ...settings,
  },
  computed: {
    ...mapGetters(["settings"]),
    ...mapGetters(["selectedFont"]),
  },
  methods: {
    onInput(e) {
      this.notifyWindow();
      this.$emit("update", e.target.innerHTML);
    },
    notifyWindow() {
      // trigger resize event so that Fitter can be positioned
      window.dispatchEvent(new Event("resize"));
    },
  },
};
</script>

<style lang="scss">
.font-sample {
  font-size: 100% / $font-scale;
  flex: 1;
  overflow: auto;
  padding: 10px 15px;

  @for $i from 1 through 6 {
    h#{$i} {
      margin: (1.8rem / $i) 0 (0.6rem / $i) 0;
    }
  }
  p {
    margin: 0.4rem 0;
  }

  &:focus {
    outline: none;
  }
}
</style>
