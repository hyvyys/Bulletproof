<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div :class="`font-sample ${isGotchas ? 'gotchas' : ''}`"
    :lang="selectedLoclLanguage"
    :style="`
        color: ${settings.textColor};
        background: ${settings.backgroundColor};
        font-size: ${settings.fontSize}${settings.fontSizeUnit};
        line-height: ${settings.defaultLineHeight ? '' : settings.lineHeight};
        letter-spacing: ${settings.defaultTracking ? '0' : settings.tracking}em;
        text-align: ${settings.textAlign};
        text-transform: ${settings.textTransform};
        font-feature-settings: ${ fontFeatureSettings };
        font-variation-settings: ${ fontVariationSettings };
    `"
  >
    <div
      ref="content"
      class="font-sample-content"
      contenteditable
      spellcheck="false"
      @input="onInput"
      v-html="html"
    />
  </div>
</template>

<script>
import scrollToHash from "@/utils/scrollToHash";
import DomSelection from "@/utils/DomSelection";
import { mapState, mapGetters } from "vuex";

export default {
  name: "FontSample",
  props: {
    html: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      selection: null,
    };
  },
  computed: {
    ...mapState({
      scrolledParentSelector: state => state.layout.scrolledParentSelector,
    }),
    ...mapGetters([
      "selectedSampleKey",
      "settings",
      "selectedLoclLanguage",
      "selectedFont",
      "selectedBoldFont",
      "selectedItalicFont",
      "formatRequested",
      "fontFeatureSettings",
      "fontVariationSettings",
    ]),
    isGotchas() { return this.selectedSampleKey === "gotchas"; },
  },
  watch: {
    async html() {
      // wait for html to get rendered
      await this.$nextTick();
      this.selection.restore();
      this.configureAnchors();
    },
    formatRequested(tag) {
      if (tag) {
        this.selection.wrap(tag);
        this.$store.commit("format", { tag: "" });
        this.$refs.content.focus();
      }
    },
  },
  mounted() {
    this.selection = new DomSelection(this.$refs.content);
    this.configureAnchors();
  },
  methods: {
    configureAnchors() {
      const anchors = document.querySelectorAll("a[href^='#']");
      const scrolled = document.querySelector(this.scrolledParentSelector);
      anchors.forEach(a => {
        a.addEventListener("click", function(e) {
          e.preventDefault();
          scrollToHash(a, scrolled);
        });
      });
    },
    onInput(e) {
      this.notifyWindow();
      this.selection.save();

      const headingSelector = 'h1, h2, h3, h4, h5, h6';

      this.$refs.content.querySelectorAll("h3 h3").forEach(h3 => {
        const text = h3.innerText;
        h3.parentNode.replaceChild(document.createTextNode(text), h3);
      });

      this.$refs.content.querySelectorAll(headingSelector).forEach(h => {
        const text = h.innerText.trim();
        if (!text) {
          h.parentNode.removeChild(h);
        }
      });

      const headingNodes = this.$refs.content.querySelectorAll(headingSelector);
      const headings = Array.from(headingNodes)
        .map(({ id, innerText }) => ({ id, text: innerText }));

      this.$refs.content.querySelectorAll("[style]").forEach(e => e.removeAttribute("style"));

      const html = e.target.innerHTML;
      this.$emit("update", { html, headings });
    },
    notifyWindow() {
      // trigger resize event so that Fitter can be positioned
      window.dispatchEvent(new Event("resize"));
    },
  },
};
</script>

<style lang="scss">
@import "@/scss/mixins";

.font-sample {
  font-size: 100% / $font-scale;
  flex: 1;
  padding: 10px 15px;

  @for $i from 1 through 6 {
    h#{$i} {
      margin: (1.8rem / $i) 0 (0.6rem / $i) 0;
    }
  }
  p {
    margin: 0.4rem 0;
  }

  overflow: auto hidden;
  position: relative;

  .font-sample-content {

    height: 100%;
    padding-bottom: 100vh;
    white-space: pre-wrap;

    &:focus {
      outline: none;
    }
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

    .gotcha-heading {
      @include pseudo();
      margin-bottom: 0.8rem;
      &::after {
        top: 100%;
        width: 4rem;
        height: 4px;
        background: linear-gradient(to right, lighten($accent, 10%), $brand-primary-color);
      }
    }
  }
}

@import "@/scss/dark";

.gotchas {
  h3, h4, .header, .desc, .desc > * {
    font-family: $font-stack !important;
    font-size: 1rem;
    em {
      font-style: italic;
    }
    strong {
      font-weight: 700;
    }
  }
  h3 {
    @include dark;
    font-size: 1.2rem;
    // display: inline-block;
    padding: 0 0.5em;
    min-width: 10em;
  }
  h4 {
    font-weight: 500 !important;
  }

  .header {
    display: flex;
    align-items: baseline;
    > * {
      margin-right: .4rem;
    }
    h4 {
      font-size: 1.2rem;
    }
  }
  .desc {
  }
  .tags {
    span {
      @include dark;
      padding: 2px 4px;
      margin: 0 2px;
    }
  }
}
</style>
