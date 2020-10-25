<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="font-sample"
    :lang="selectedLoclLanguage"
    :style="`
        color: ${settings.textColor};
        background: ${settings.backgroundColor};
        line-height: ${settings.defaultLineHeight ? '' : settings.lineHeight};
        letter-spacing: ${settings.defaultTracking ? '0' : settings.tracking}em;
        text-align: ${settings.textAlign};
        text-transform: ${settings.textTransform};
        font-feature-settings: ${ fontFeatureSettings };
        font-variation-settings: ${ fontVariationSettings };
    `"
  >
   <slot />
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

.font-sample * {
  font-family: var(--selectedFontFamily), var(--fallbackFontFamily);
  font-weight: normal;
}
</style>
