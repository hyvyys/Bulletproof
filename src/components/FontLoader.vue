<template>
  <div class="font-loader">
    <FontSelect
      class="dark"
      v-if="gui"
      :fonts="fontOptions"
      :value="selectedFont"
      @input="selectFont"
      :loading="loadingFonts"
    />

    <div v-if="gui">
      <UiButton class="dark bi-button" ref="button1">
        <b>B</b>
        <i>I</i>
      </UiButton>
      <UiPopover :trigger="$refs.button1" class="font-select-popover" :zIndex="58">
        <FontSelect
          :fonts="fontOptions"
          :value="selectedBoldFont"
          @input="selectBoldFont"
          label="Headings & strong emphasis"
          :loading="loadingFonts"
        />

        <FontSelect
          :fonts="fontOptions"
          :value="selectedItalicFont"
          @input="selectItalicFont"
          label="Emphasis"
          :loading="loadingFonts"
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
      loadingFonts: false,
      openedWithoutFonts: true,
      defaultFontsLoaded: false,
    };
  },
  watch: {
    gui () {
      this.init();
    },
  },
  mounted() {
    styles.setProperty("--fallbackFontFamily", this.settings.fallbackFontFamily);
    this.init();
  },
  methods: {
    init() {
      if (this.gui && this.openedWithoutFonts && !this.defaultFontsLoaded) {
        this.loadDefaultFonts();
      }
    },

    loadDefaultFonts() {
      this.defaultFontsLoaded = true;
      const dir = "/fonts/";
      const fonts = [
        "alegreya-sans/alegreya-sans-v10-latin-ext_cyrillic_cyrillic-ext_latin_vietnamese_greek-ext_greek-regular.ttf",
        "alegreya-sans/alegreya-sans-v10-latin-ext_cyrillic_cyrillic-ext_latin_vietnamese_greek-ext_greek-italic.ttf",
        "alegreya-sans/alegreya-sans-v10-latin-ext_cyrillic_cyrillic-ext_latin_vietnamese_greek-ext_greek-700.ttf",
        "Rywalka-Regular.ttf",
      ];
      this.loadFonts({ urls: fonts.map(f => dir + f) });
    },

    async onFilesDropped(files) {
      this.openedWithoutFonts = false;
      // disable Fireworks
      // this.$refs.fireworks.$emit('event');
      await this.loadFonts({ files });
      if (this.$route.path === "/") {
        this.$router.push({ path: 'lettering' });
      }
    },

    async loadFonts({ files = [], urls = [] } = {}) {
      this.loadingFonts = true;

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
          const fonts = results
            .filter(r => r.font)
            .map(r => r.font);
          fonts.sort((a, b) =>
              a.family.localeCompare(b.family)
              || a.cssWeight - b.cssWeight
              || b.cssStyle.localeCompare(a.cssStyle)
            );

          fonts.reverse();
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
            fonts.reverse();
            this.selectFont(fonts[0]);
          }

          const errors = results.filter(r => r.error);
          if (errors.length) {
            this.printFontLoadingError(results);
          }
        })
        .catch(error => {
          this.printFontLoadingError([], error);
        })
        .finally(() => {
          this.loadingFonts = false;
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

      function waterfallFilter(array, ...predicates) {
        for (let predicate of predicates) {
          const results = array.filter(predicate);
          if (results.length) {
            return results;
          }
        }
        return array;
      }

      const fontsByWeight = this.fonts.slice().sort((a, b) => a.cssWeight > b.cssWeight);
      const matchingBold = waterfallFilter(fontsByWeight,
        f => f.family === v.family && f.cssWeight - v.cssWeight === 300,
        f => f.family === v.family && f.cssWeight - v.cssWeight >= 200,
        f => f.family === v.family && f.cssWeight - v.cssWeight > 0,
        f => f.family === v.family && f.cssWeight - v.cssWeight === 0,
      )[0];
      const matchingItalic = waterfallFilter(this.fonts.slice(),
        f => f.family === v.family && f.cssWeight === v.cssWeight && f.cssStyle === "italic",
        f => f.family === v.family && f.cssWeight < v.cssWeight && f.cssStyle === "italic",
        f => f.family === v.family && f.cssStyle === "italic",
        f => f.family === v.family && f.cssWeight <= v.cssWeight,
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
  display: flex;
  align-items: center;

  .ui-select.font-select {
    .ui-select__display {
      padding: 2px 8px;
      width: $font-select-width;
      border-radius: 3px;
    }
    margin-bottom: 0;
  }
}

.font-loader {
  > :not(:last-child) {
    margin-right: 0.5em;
  }
}

.font-select-popover {
  padding: 8px;
  width: calc(#{$font-select-width} + 16px);
}

.bi-button {
  min-width: unset;
  text-transform: none;
  font-family: $monospaced;
  b {
    margin-right: 0.2em;
  }
}
</style>
