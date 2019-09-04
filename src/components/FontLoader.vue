<template>
  <div class="font-loader">
    <FontSelect class="dark" v-if="gui" :fonts="fontOptions" :value="selectedFont" @input="selectFont" />

    <div v-if="gui">
      <UiButton class="dark bi-button" ref="button1">
        B
        <i>I</i>
      </UiButton>
      <UiPopover :trigger="$refs.button1" class="font-select-popover" :zIndex="58">
        <FontSelect
          :fonts="fontOptions"
          :value="selectedBoldFont"
          @input="selectBoldFont"
          label="Strong emphasis font"
        />

        <FontSelect
          :fonts="fontOptions"
          :value="selectedItalicFont"
          @input="selectItalicFont"
          label="Emphasis font"
        />
      </UiPopover>
    </div>

    <FileDrop @files-dropped="onFilesDropped" />
    <UiModal ref="modal" title="Error opening fonts.">
      <div>
        <div>{{ errorMessage }}</div>
        <code v-for="(log, i) in errorLogs" :key="i">{{ log }}</code>
      </div>
    </UiModal>

    <Fireworks ref="fireworks" :font="selectedFont.family" />
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import UiModal from "keen-ui/src/UiModal.vue";
import UiButton from "keen-ui/src/UiButton.vue";
import UiPopover from "keen-ui/src/UiPopover.vue";

import FontSelect from "@/components/FontSelect.vue";
import FileDrop from "@/components/FileDrop.vue";
import Fireworks from "@/components/Fireworks.vue";

import FontParser from "@/models/FontParser";

import styles from "@/utils/styles";
import { Promise } from "q";

export default {
  name: "FontTester",
  components: {
    FontSelect,
    UiModal,
    UiButton,
    UiPopover,
    FileDrop,
    Fireworks,
  },
  props: {
    gui: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapGetters([
      "settings",
      "selectedFont",
      "selectedBoldFont",
      "selectedItalicFont",
    ]),
    fontOptions() {
      return this.fonts.map(f => f.serialize());
    },
  },
  data() {
    return {
      fonts: [],
      errorMessage: "",
      errorLogs: [],
    };
  },
  beforeMount() {
    const dir = "/fonts/";
    const fonts = [
      "alegreya-sans/alegreya-sans-v10-latin-ext_cyrillic_cyrillic-ext_latin_vietnamese_greek-ext_greek-regular.ttf",
      "alegreya-sans/alegreya-sans-v10-latin-ext_cyrillic_cyrillic-ext_latin_vietnamese_greek-ext_greek-italic.ttf",
      "alegreya-sans/alegreya-sans-v10-latin-ext_cyrillic_cyrillic-ext_latin_vietnamese_greek-ext_greek-700.ttf",
      "Rywalka-Regular.ttf",
    ];
    styles.setProperty("--fallbackFontFamily", this.settings.fallbackFontFamily);
    this.loadFonts({ urls: fonts.map(f => dir + f) });
  },
  methods: {
    onFilesDropped(files) {
      // disable Fireworks
      // this.$refs.fireworks.$emit('event');
      this.loadFonts({ files });
    },

    async loadFonts({ files = [], urls = [] } = {}) {
      if (!urls.length) {
        urls = files.map(file => URL.createObjectURL(file));
      }

      const fileNames = files.length
        ? files.map(f => f.name)
        : urls.map(u => u.replace(/.*\//, ""));

      Promise.all(urls.map(url => FontParser.parse(url)))
        .then(responses => {
          const results = responses.map((r, i) => ({
            fileName: fileNames[i],
            ...r,
          }));
          const fonts = results.filter(r => r.font).map(r => r.font);

          fonts.forEach(font => {
            const duplicates = this.fonts.filter(
              f =>
                f.originalFamily === font.originalFamily &&
                f.style === font.style
            );
            if (duplicates.length > 0) {
              const highest = duplicates.sort(
                (a, b) => a.version < b.version
              )[0];
              font.bumpVersion(highest.version + 1);
            }
            this.fonts.unshift(font);
            styles.add(font.fontFace);
          });
          if (fonts.length) {
            this.selectFont(fonts[0]);
          }

          const errors = results.filter(r => r.error);
          if (errors.length) {
            this.printFontLoadingError(results);
          }
        })
        .catch(error => {
          this.printFontLoadingError([], error);
        });
    },

    printFontLoadingError(results, extraError) {
      if (results.length) {
        const errors = results.filter(r => r.error);
        this.errorMessage = `${errors.length} out of ${results.length} files were not loaded.`;
        this.errorLogs = errors.map(e => `${e.fileName}: ${e.error}`);
      } else {
        this.errorMessage = `An unexpected error occurred.`;
        this.errorLogs = [extraError];
      }
      this.$refs.modal.open();
    },

    getFont(fontOption) {
      const font = this.fonts.find(f => f.displayName === fontOption.displayName);
      const serialized = font.serialize();
      return serialized;
    },

    selectFont(v) {
      const font = this.getFont(v);
      styles.setProperty("--selectedFontFamily", font.family);
      styles.setProperty("--selectedFontCssWeight", font.cssWeight);
      styles.setProperty("--selectedFontCssStyle", font.cssStyle);
      this.$store.commit("selectFont", { font });

      const matchingBold = this.fonts.filter(
        f => f.family === v.family && f.cssWeight >= v.cssWeight
      )[0];
      const matchingItalic = this.fonts.filter(
        f =>
        f.family === v.family && f.cssWeight === v.cssWeight && f.style === "italic"
        ||
        f.family === v.family && f.style === "italic"
        ||
        f.family === v.family && f.cssWeight <= v.cssWeight
      )[0];

      this.selectBoldFont(matchingBold);
      this.selectItalicFont(matchingItalic);
    },

    selectBoldFont(v) {
      const boldFont = this.getFont(v);
      styles.setProperty("--selectedBoldFontFamily", boldFont.family);
      styles.setProperty("--selectedBoldFontCssWeight", boldFont.cssWeight);
      styles.setProperty("--selectedBoldFontCssStyle", boldFont.cssStyle);
      this.$store.commit("selectFont", { boldFont });
    },

    selectItalicFont(v) {
      const italicFont = this.getFont(v);
      styles.setProperty("--selectedItalicFontFamily", italicFont.family);
      styles.setProperty("--selectedItalicFontCssWeight", italicFont.cssWeight);
      styles.setProperty("--selectedItalicFontCssStyle", italicFont.cssStyle);
      this.$store.commit("selectFont", { italicFont });
    },

    /* ^^^ methods ^^^ */
  },
};
</script>

<style lang="scss">
@import "@/scss/variables";
@import "@/scss/mixins";

.font-loader {
  @include flex();

  .ui-select.font-select {
    .ui-select__display {
      padding: 2px 8px;
      width: 12em;
      border-radius: 3px;
    }
    margin-bottom: 0.1em;
  }
}

.font-loader {
  > :not(:last-child) {
    margin-right: 0.5em;
  }
}

.font-select-popover {
  padding: 8px;
  width: 150px;
}

.bi-button {
  min-width: unset;
  font-family: Consolas, "Courier New", Courier, monospace;
}
</style>
