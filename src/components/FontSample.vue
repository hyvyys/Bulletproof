<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="font-sample"
    :style="`
        color: ${settings.textColor};
        background: ${settings.backgroundColor};
        line-height: ${settings.enableLineHeight ? settings.lineHeight : ''};
        letter-spacing: ${settings.enableTracking ? settings.tracking : '0'}em;
        word-spacing: ${settings.enableWordSpacing ? settings.wordSpacing : '0'}em;
        text-align: ${settings.textAlign};
        text-transform: ${settings.enableTextTransform ? settings.textTransform : 'none'};
        font-feature-settings: ${ fontFeatureSettings };
        font-variation-settings: ${ fontVariationSettings };
    `"
  >

    <div
      class="font-sample-content"
      :style="{
        'word-break': settings.wrapLines ? 'break-all' : 'normal',
      }"
    >
      <slot />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  name: "FontSample",
  computed: {
    ...mapState({
      scrolledParentSelector: state => state.layout.scrolledParentSelector,
    }),
    ...mapGetters([
      "selectedSampleKey",
      "displayedSettings",
      "selectedLoclLanguage",
      "selectedFont",
      "selectedBoldFont",
      "selectedItalicFont",
      "selectedBoldItalicFont",
      "formatRequested",
      "fontFeatureSettings",
      "fontVariationSettings",
      "languageSupport",
    ]),
    settings() { return this.displayedSettings },
  },
};
</script>

<style lang="scss">
@import "@/scss/mixins";
@import "@/scss/dark";

.font-sample {
  .font-sample-content {
    font-family: var(--selectedFontFamily), var(--fallbackFontFamily);
    font-weight: normal; // sets to 400 even if variable font has different default instance
    font-weight: var(--selectedFontCssWeight);
    // font-style: var(--selectedFontCssStyle);
    white-space: pre-wrap;
    &:focus {
      outline: none;
    }

    .font-sample-content-inner {
      &::after {
        content: '\A0';
      }
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--selectedHeaderFontFamily), var(--fallbackFontFamily);
      // font-weight: normal;
      // font-style: normal;
      // white-space: normal;
      font-weight: var(--selectedBoldFontCssWeight, 700);
      // font-style: var(--selectedBoldFontCssStyle);
      // font-weight: 700;
    }

    b, strong {
      font-family: var(--selectedBoldFontFamily), var(--fallbackFontFamily);
      // font-weight: normal;
      // font-style: normal;
      // white-space: normal;
      font-weight: var(--selectedBoldFontCssWeight, 700);
      // font-style: var(--selectedBoldFontCssStyle);
      // font-weight: 700;

      em {
        font-family: var(--selectedBoldItalicFontFamily), var(--fallbackFontFamily);
        font-weight: 300;
      }
    }

    i, em {
      font-family: var(--selectedItalicFontFamily), var(--fallbackFontFamily);
      font-weight: var(--selectedItalicFontCssWeight);
      // font-style: var(--selectedItalicFontCssStyle);
      // font-weight: normal;
      font-style: normal;
      b, strong {
        font-family: var(--selectedBoldItalicFontFamily), var(--fallbackFontFamily);
        font-weight: var(--selectedBoldItalicFontCssWeight);
      }
    }
  }
}

</style>
