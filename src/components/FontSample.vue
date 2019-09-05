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
      ref="content"
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
import getId from "@/utils/id";
import DomSelection from "@/utils/DomSelection";
import { mapGetters } from "vuex";

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
    ...mapGetters([
      "settings",
      "selectedLoclLanguage",
      "selectedFont",
      "selectedBoldFont",
      "selectedItalicFont",
      "formatRequested",
    ]),
    fontFeatureSettings() {
      return this.settings.gsubFeatures.concat(this.settings.gposFeatures)
        .map(f => `'${f.tag}' ${f.value ? '1' : '0'} `)
        .join(', ');
    },
  },
  watch: {
    async html() {
      // wait for html to get rendered
      await this.$nextTick();
      // this is only called when custom text is being created
      // html is still being synced for custom texts,
      // but this watcher isn't triggered
      // ...idk why, but that's convenient
      // TODO: debug the reason
      this.selection.restore();
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
  },
  methods: {
    onInput(e) {
      this.notifyWindow();
      this.selection.save();
      const headingNodes = this.$refs.content.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headingNodes.forEach(h => {
        if (!h.id) {
          const isCurrent = window.location.hash === `#${h.id}`;
          h.id = getId(h.innerText);
          if (isCurrent) {
            window.location.hash = `#${h.id}`;
          }
        }
      });
      const headings = Array.from(headingNodes)
        .map(({ id, innerText }) => ({ id, text: innerText }));
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

  overflow: hidden;

  .font-sample-content {
    height: 100%;
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

  }
}

</style>
