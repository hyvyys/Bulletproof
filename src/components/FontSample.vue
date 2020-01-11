<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div :class="`font-sample ${isGotchas ? 'gotchas' : ''}`"
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

    <!-- <LanguageSupportSummary v-if="selectedSampleKey === 'languages'" languageSupport="languageSupport" /> -->

    <div v-if="selectedSampleKey === 'glyphs'">This page only lists encoded glyphs.</div>

    <div
      class="font-sample-content"
      :style="{
        'word-break': settings.wrapLines ? 'break-all' : 'normal',
      }"
    >

      <div v-if="!isCustom">
        <div v-for="(item, i) in texts" :key="i" >

          <GotchaHeader
            v-if="selectedSampleKey === 'gotchas'"
            :header="item.header"
          />
          <SampleHeader v-else-if="item.header.language" :header="item.header" />

          <div v-for="(text, j) in item.texts" :key="j">
            <div v-for="(size, k) in fontSizes" :key="k" class="sample-paragraph">
              <div v-if="fontSizes.length > 1"  class="font-size-label">{{size}}</div>
              <div
                v-html="text"
                :style="{ 'font-size': `${size}${settings.fontSizeUnit}` }"
                contenteditable
                spellcheck="false"
              />
            </div>
          </div>

        </div>
      </div>

      <div v-else>
        <div v-for="(size, k) in fontSizes" :key="k" class="sample-paragraph">
          <div v-if="fontSizes.length > 1"  class="font-size-label">{{size}}</div>
          <div
            class="font-sample-content-inner"
            :style="{ 'font-size': `${size}${settings.fontSizeUnit}` }"
            contenteditable
            spellcheck="false"
            @paste="onPaste"
            @input="onInput"
            @focus="onFocus"
            ref="content"
          />
        </div>
      </div>
    </div>

  </div>
</template>

<script>
import DomSelection from "@/utils/DomSelection";
import SampleHeader from "@/components/SampleHeader";
import GotchaHeader from "@/components/GotchaHeader";
import { mapState, mapGetters } from "vuex";

export default {
  name: "FontSample",
  components: {
    SampleHeader,
    GotchaHeader,
  },
  props: {
    texts: {
      type: Array,
      default: () => [],
    },
    isCustom: {
      type: Boolean,
      default: false,
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
      "selectedBoldItalicFont",
      "formatRequested",
      "fontFeatureSettings",
      "fontVariationSettings",
      "languageSupport",
    ]),
    isGotchas() { return this.selectedSampleKey === "gotchas"; },
    fontSizes() {
      return this.settings.enableWaterfall
        ? this.settings.waterfallSizes.split(',')
        : [ this.settings.fontSize ]
    },
  },
  watch: {
    formatRequested(tag) {
      if (tag) {
        try {
          this.selection.wrap(tag);
          this.saveText(this.selection.container);
        }
        finally {
          // clear tag after applying
          this.$store.commit("format", { tag: "" });
        }
      }
      else {
        this.selection.container.focus();
      }
    },
  },
  mounted() {
    // this.configureAnchors();
    this.syncSamples();
    this.$watch('texts', this.syncSamples, { deep:true });
    this.$watch('fontSizes', this.syncSamples, { deep:true });
  },
  beforeDestroy() {
  },
  methods: {
    configureAnchors() {
      return;
      // doesn't work any more but... what problem this that fixed? body overscroll?
      // const anchors = document.querySelectorAll("a[href^='#']");
      // const scrolled = document.querySelector(this.scrolledParentSelector);
      // anchors.forEach(a => {
      //   a.addEventListener("click", function(e) {
      //     e.preventDefault();
      //     scrollToHash(a, scrolled);
      //   });
      // });
    },
    onPaste(event) {
      let paste = (event.clipboardData || window.clipboardData).getData('text');
      // paste = paste.replace(/font-family:[^;]+;?/g, '');
      const selection = window.getSelection();
      if (!selection.rangeCount) return false;
      selection.deleteFromDocument();
      selection.getRangeAt(0).insertNode(document.createTextNode(paste));
      this.saveText(event.target);
      event.preventDefault();
    },
    onInput(e) {
      this.saveText(e.target);
    },
    onFocus(e) {
      this.selection = new DomSelection(e.target);
    },
    syncSamples() {
      if (this.isCustom) {
        const customText = this.texts[0].html;
        const c = this.$refs.content;
        if (c) {
          const elements = c instanceof Array ? this.$refs.content : [ this.$refs.content ];
          elements
            .filter(sample => sample !== document.activeElement)
            .forEach(sample => sample.innerHTML = customText);
        }
      }
    },
    saveText(target) {
      if (this.isCustom) {
        const customText = target.innerHTML;
        this.$emit("update", { html: customText, headings: [] });
      }
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
@import "@/scss/dark";

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

  .sample-paragraph {
    position: relative;
  }
  .font-size-label {
    font-size: 8px;
    font-family: Arial;
    position: absolute;
    right: 100%;
    padding: 0 2px;
    top: 0;
    width: 2em;
    text-align: right;
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
    // font-weight: var(--selectedFontCssWeight);
    // font-style: var(--selectedFontCssStyle);

    .font-sample-content-inner {
      &::after {
        content: '\A0';
      }
    }

    h1, h2, h3, h4, h5, h6 {
      font-family: var(--selectedHeaderFontFamily), var(--fallbackFontFamily);
      // font-weight: var(--selectedBoldFontCssWeight);
      // font-style: var(--selectedBoldFontCssStyle);
      font-weight: normal;
      font-style: normal;
      white-space: normal;
    }

    b, strong {
      font-family: var(--selectedBoldFontFamily), var(--fallbackFontFamily);
      // font-weight: var(--selectedBoldFontCssWeight);
      // font-style: var(--selectedBoldFontCssStyle);
      font-weight: normal;
      font-style: normal;
      white-space: normal;

      em {
        font-family: var(--selectedBoldItalicFontFamily), var(--fallbackFontFamily);
      }
    }

    i, em {
      font-family: var(--selectedItalicFontFamily), var(--fallbackFontFamily);
      // font-weight: var(--selectedItalicFontCssWeight);
      // font-style: var(--selectedItalicFontCssStyle);
      font-weight: normal;
      font-style: normal;
      b, strong {
        font-family: var(--selectedBoldItalicFontFamily), var(--fallbackFontFamily);
      }
    }
  }

  .header-flex {
    font-weight: normal;
    font-style: normal;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    border-bottom: 1px solid currentColor;
    margin-top: 1rem;
    font-family: $font-stack !important;
    font-size: 1rem;

    @include dark;
    padding: 0 0.5em;
    min-width: 10em;
    h3, code {
      user-select: all;
    }
    > * {
      margin: 0;
      margin-right: 1rem;
    }

    .light {
      font-size: 0.9em;
      opacity: 0.5;
    }
  }
}



.gotchas {
  h3, h4, .header, .desc, .desc > * {
    font-family: $font-stack !important;
    em {
      font-style: italic;
    }
    strong {
      font-weight: 700;
    }
  }
}

.font-characters {
  display: flex;
  flex-wrap: wrap;

  > * {
    flex: 0 0 1em;
    text-align: center;
    &:hover {
      background: #ffffff66;
    }
  }
}
</style>
