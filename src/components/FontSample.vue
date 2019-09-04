<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="font-sample"
    :lang="selectedLoclLanguage"
    :style="`
        color: ${settings.textColor};
        background: ${settings.backgroundColor};
    `"
  >
    <div
      class="font-sample-content"
      contenteditable
      spellcheck="false"
      :style="`
        font-size: ${settings.fontSize}${settings.fontSizeUnit};
        line-height: ${settings.defaultLineHeight ? '' : settings.lineHeight};
        text-align: ${settings.textAlign};
        text-transform: ${settings.textTransform};
        font-feature-settings: ${ fontFeatureSettings };
      `"
      @input="onInput"
      v-html="html"
    />
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "FontSample",
  props: {
    html: {
      type: String,
      default: "",
    },
  },
  computed: {
    ...mapGetters([
      "settings",
      "selectedLoclLanguage",
      "selectedFont",
      "selectedBoldFont",
      "selectedItalicFont",
    ]),
    fontFeatureSettings() {
      return this.settings.gsubFeatures.concat(this.settings.gposFeatures)
        .map(f => `'${f.tag}' ${f.value ? '1' : '0'} `)
        .join(', ');
    },
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

  .font-sample-content {
    font-family: var(--selectedFontFamily), var(--fallbackFontFamily);
    font-weight: var(--selectedFontCssWeight);
    font-style: var(--selectedFontCssStyle);

    h1, h2, h3, h4, h5, h6, b, strong {
      font-family: var(--selectedBoldFontFamily), var(--fallbackFontFamily);
      font-weight: var(--selectedBoldFontCssWeight);
      font-style: var(--selectedBoldFontCssStyle);
    }

    i, em {
      font-family: var(--selectedItalicFontFamily), var(--fallbackFontFamily);
      font-weight: var(--selectedItalicFontCssWeight);
      font-style: var(--selectedItalicFontCssStyle);
    }

  }
}

</style>
