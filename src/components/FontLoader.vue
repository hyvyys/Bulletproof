<template>
  <div class="font-loader">
    <span class="font-loader-item" v-if="gui">
      <UiFileupload
        class="dark"
        label=" "
        name="font-file-input"
        accept=".ttf,.otf,.woff,.woff2"
        :multiple="true"
        size="small"
        @change="onFilesDropped"
      />
      <UiTooltip>
        You can also drag and drop font files anywhere on the page.
      </UiTooltip>
    </span>

    <FontSelect
      class="dark font-select-main font-loader-item"
      v-if="gui"
      :fonts="fontOptions"
      :value="selectedFont"
      @input="selectFont"
      :loading="fontLoading"
    />

    <div v-if="gui" class="font-loader-item">
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
          :loading="fontLoading"
        />

        <FontSelect
          :fonts="fontOptions"
          :value="selectedItalicFont"
          @input="selectItalicFont"
          label="Emphasis"
          :loading="fontLoading"
        />
      </UiPopover>
    </div>

    <FileDrop ref="fileDrop" @filesDropped="onFilesDropped" />

    <transition name="fade-slow-reverse">
      <UiProgressLinear
        v-show="progressVisible"
        type="determinate"
        :progress="fontLoadingProgress"
        class="font-loading-progress"
      />
    </transition>

    <UiModal ref="modal" title="Error opening fonts.">
      <div>
        <div>{{ errorMessage }}</div>
        <pre v-for="(log, i) in errorLogs" :key="i">{{ log }}</pre>
      </div>
    </UiModal>

    <Fireworks ref="fireworks" :font="selectedFont.family" />
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";

import UiModal from "keen-ui/src/UiModal.vue";
import UiFileupload from "keen-ui/src/UiFileupload.vue";
import UiButton from "keen-ui/src/UiButton.vue";
import UiPopover from "keen-ui/src/UiPopover.vue";
import UiTooltip from "keen-ui/src/UiTooltip.vue";
import UiProgressLinear from "keen-ui/src/UiProgressLinear";

import FontSelect from "@/components/FontSelect.vue";
import FileDrop from "@/components/FileDrop.vue";
import Fireworks from "@/components/Fireworks.vue";

import LoadFontWorker from 'worker-loader!@/models/loadFont.worker.js';
import Font from "@/models/Font";

import styles from "@/utils/styles";

export default {
  name: "FontTester",
  components: {
    FontSelect,
    UiModal,
    UiButton,
    UiPopover,
    UiProgressLinear,
    UiFileupload,
    FileDrop,
    UiTooltip,
    Fireworks,
  },
  props: {
    gui: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    ...mapState([
      "fontLoading",
    ]),
    ...mapGetters([
      "settings",
      "selectedFont",
      "selectedBoldFont",
      "selectedItalicFont",
      "selectedSampleKey",
    ]),
    fontOptions() {
      return this.fonts.map(f => f.serialize());
    },
    progressVisible() {
      return this.fontLoading && this.selectedSampleKey !== "";
    },
  },
  data() {
    return {
      fonts: [],
      errorMessage: "",
      errorLogs: [],
      fontLoadingProgress: 0,
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
        "Graduate.ttf",
      ];
      this.loadFonts({ urls: fonts.map(f => dir + f) });
    },

    onFilesDropped(files) {
      this.openedWithoutFonts = false;
      // disable Fireworks
      // this.$refs.fireworks.$emit('event');
      if (this.$route.path === "/") {
        this.$router.push({ path: 'lettering' });
      }
      this.loadFonts({ files: Array.from(files) });
    },

    loadFonts({ files = [], urls = [] } = {}) {
      if (!urls.length) {
        urls = files.map(file => URL.createObjectURL(file));
      }
      if (!urls.length) {
        return;
      }
      this.fontLoadingProgress = 0;
      this.$store.dispatch("fontLoadStart");
      const fileNames = files.length
        ? files.map(f => f.name)
        : urls.map(u => u.replace(/.*\//, ""));

      const fonts = [];
      const errors = [];
      const worker = new LoadFontWorker();

      worker.onmessage = (e) => {
        i++;
        if (e.data.font) {
          const { font: opentypeFont, url } = e.data;
          const font = new Font(opentypeFont, url);
          const duplicates = this.fonts.concat(fonts).filter(f =>
            f.originalFamily === font.originalFamily &&
            f.style === font.style
          ).map(f => f.version);
          if (duplicates.length > 0) {
            const highest = Math.max(...duplicates);
            font.bumpVersion(highest + 1);
          }
          styles.add(font.fontFace);
          fonts.push(font);
          this.fontLoadingProgress = 100 * i / urls.length;

        }
        else if (e.data.error) {
          const { error, fileName } = e.data;
          errors.push({ error, fileName });
        }

        if (i === urls.length) {
          if (fonts.length) {
            fonts.sort((a, b) =>
              a.family.localeCompare(b.family)
              || a.cssWeight - b.cssWeight
              || b.cssStyle.localeCompare(a.cssStyle)
            );
            // don't make font objects reactive for performance gains
            this.fonts = Object.freeze([ ...fonts, ...this.fonts ]);
            this.selectFont(fonts[0]);
          }
          if (errors.length) {
            this.printFontLoadingError(errors);
          }
          this.$store.dispatch("fontLoadEnd");
        }
      }

      let i = 0;
      urls.forEach((url, i) => {
        worker.postMessage({ url, fileName: fileNames[i] });
      })
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
@import "@/scss/dark";

.font-loader {
  display: flex;
  align-items: center;

  .font-loader-item {
    margin: 0 2px;
  }

  .ui-fileupload {
    padding: 4px;
    min-width: 0;
    .ui-fileupload__icon {
      margin-right: 0;
    }
    .ui-fileupload__display-text {
      display: none !important;
    }
  }
  .ui-select.font-select {
    .ui-select__display {
      padding: 2px 8px;
      width: $font-select-width;
      border-radius: 3px;
    }
    margin-bottom: 0;
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
  padding: 0 6px;
  b {
    margin-right: 0.2em;
  }
}

.bi-button, .ui-fileupload {
  border-radius: 3px;
  border-bottom: 2px solid $color-tinted;
  &:hover {
    border-color: $color-tinted-active;
  }
}

.font-loading-progress {
  position: fixed;
  top: 50%;
  left: 30%;
  right: 30%;
  width: 40%;
  height: 1rem;

  .ui-progress-linear__progress-bar {
    height: 100%;
  }
}


.overlay {
  z-index: 1;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba($light, 0.8);
  box-shadow: inset 0 0 20vh $light;

  transition: opacity 0.5s;
}
</style>
