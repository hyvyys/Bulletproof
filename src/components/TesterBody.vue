<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div :class="`tester-body ${isGotchas ? 'gotchas' : ''}`"
    :style="`background: ${settings.backgroundColor};`"
  >

    <template v-if="selectedSampleKey === 'glyphs'">This page only lists encoded glyphs.</template>
    <template v-if="!isCustom">
      <div v-for="(item, i) in texts" :key="i">
        <GotchaHeader v-if="selectedSampleKey === 'gotchas'" :header="item.header" />
        <SampleHeader v-else-if="item.header && item.header.language" :header="item.header" />

        <FontSample v-for="(text, j) in item.texts" :key="j" :lang="selectedLoclLanguage || item.header && item.header.htmlTag">
          <div v-for="(size, k) in fontSizes" :key="k" class="sample-paragraph">
            <div v-if="fontSizes.length > 1"  class="font-size-label">{{size}}</div>
            <div
              v-html="transformText(text, item.header && item.header.htmlTag)"
              :style="{ 'font-size': `${size}${settings.fontSizeUnit}` }"
              :contenteditable="isContentEditable"
              spellcheck="false"
              @focus="onFocus"
            />
          </div>
        </FontSample>
      </div>
    </template>

    <FontSample v-else :lang="selectedLoclLanguage">
      <div v-for="(size, k) in fontSizes" :key="k" class="sample-paragraph">
        <div v-if="fontSizes.length > 1"  class="font-size-label">{{size}}</div>
        <div
          class="font-sample-content-inner"
          :style="{ 'font-size': `${size}${settings.fontSizeUnit}` }"
          contenteditable
          spellcheck="false"
          @input="onInput"
          @focus="onFocus"
          ref="content"
        />
      </div>
    </FontSample>

  </div>
</template>

<script>
import DomSelection from "@/utils/DomSelection";
import FontSample from "@/components/FontSample";
import SampleHeader from "@/components/SampleHeader";
import GotchaHeader from "@/components/GotchaHeader";
import { mapState, mapGetters } from "vuex";

export default {
  name: "TesterBody",
  components: {
    SampleHeader,
    GotchaHeader,
    FontSample,
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
      isContentEditable: true,
    };
  },
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
    isGotchas() { return this.selectedSampleKey === "gotchas"; },
    fontSizes() {
      return this.settings.enableWaterfall
        ? this.settings.waterfallSizes.split(',')
        : [ this.settings.fontSize ]
    },
  },
  watch: {
    formatRequested(tag) {
      if (!this.selection) return;
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
    this.syncSamples();
    this.$watch('texts', this.syncSamples, { deep:true });
    this.$watch('fontSizes', this.syncSamples, { deep:true });
  },
  beforeDestroy() {
  },
  methods: {
    onPaste(event) {
      let paste = (event.clipboardData || window.clipboardData).getData('text');
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
    transformText(text) {
      return text;
    },
  },
};
</script>

<style lang="scss">
@import "@/scss/mixins";
@import "@/scss/dark";

.tester-body {
  font-size: 100% / $font-scale;
  flex: 1;
  padding: 10px 15px;
  min-height: 100vh;
  padding-bottom: 10rem;


  display: flex;
  flex-direction: column;
  .font-sample {
    flex: 1;

    .font-sample-content-inner {
      &::after {
        content: '\A0';
      }
    }
  }

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

  .header-flex {
    font-weight: normal;
    font-style: normal;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    @media (max-width: 1000px) {
      gap: 4px 0;
      padding: 4px 8px;
      // display: grid;
      // grid-template-columns: 1fr auto auto;
      // grid-template-areas: "topic btn tags tags" "language language language-speakers language-codes";
      .tags, .language-codes, .language-speakers {
        display: none !important;
      }
      .btn {
        order: -1;
      }
      .language {
        flex: 1;
        text-align: right;
        font-weight: 400;
      }
    }
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
    h3 {
      margin-top: 0;
      margin-bottom: 0;
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
