<template>
  <div class="font-loader">
    <div class="font-loader-item" v-if="gui">
      <UiFileupload
        class="dark"
        label=" "
        name="font-file-input"
        accept=".ttf,.otf,.woff,.woff2"
        :multiple="true"
        size="small"
        @change="onFilesDropped"
      />
      <UiTooltip :openDelay="500" style="width: min(90vw,20em)">
        Open fonts (you can also drag and drop font files anywhere on the page)
      </UiTooltip>
    </div>

    <FontSelect
      class="dark font-select-main font-loader-item"
      v-if="gui"
      :fonts="fontOptions"
      :value="selectedFont"
      @input="selectFont"
      @openAddFontDialog="openAddFontDialog"
      :addFontOption="true"
      :loading="fontLoading"
    />


    <div v-if="gui" class="font-loader-item">
      <UiButton class="dark bi-button" @click="setLastFont" tooltip="Set last font">
        <img svg-inline src="@/assets/icons/swap.svg" alt="Set last font" width="14" height="14" />
      </UiButton>
    </div>

    <div v-if="gui" class="font-loader-item">
      <UiButton class="dark bi-button" @click="setPreviousFont" tooltip="Set previous font">
        <img svg-inline src="@/assets/icons/prev.svg" alt="Previous font" width="14" height="14" />
      </UiButton>
    </div>

    <div v-if="gui" class="font-loader-item">
      <UiButton class="dark bi-button" @click="setNextFont" tooltip="Set next font">
        <img svg-inline src="@/assets/icons/next.svg" alt="Next font" width="14" height="14" />
      </UiButton>
    </div>

    <div v-if="gui" class="font-loader-item">
      <UiButton class="dark bi-button" ref="button1" tooltip="Emphasis fonts">
        <b>B</b>
        <i>I</i>
      </UiButton>

      <UiPopover :trigger="$refs.button1" class="font-select-popover" :zIndex="58">
        <div class="font-select-menu">
          <FontSelect
            :fonts="fontOptions"
            :value="selectedFont"
            @input="v => setFont('regular', v)"
            label="Regular"
            :loading="fontLoading"
          />

          <UiTextbox
            label="Override"
            :value="fontOverrides.regular"
            @input="v => overrideCssFont('regular', v)"
          />

          <FontSelect
            :fonts="fontOptions"
            :value="selectedItalicFont"
            @input="v => setFont('italic', v)"
            label="Italic (emphasis)"
            :loading="fontLoading"
          />

          <UiTextbox
            label="Override"
            :value="fontOverrides.italic"
            @input="v => overrideCssFont('italic', v)"
          />

          <FontSelect
            :fonts="fontOptions"
            :value="selectedBoldFont"
            @input="v => setFont('bold', v)"
            label="Bold (strong emphasis)"
            :loading="fontLoading"
          />

          <UiTextbox
            label="Override"
            :value="fontOverrides.bold"
            @input="v => overrideCssFont('bold', v)"
          />

          <FontSelect
            :fonts="fontOptions"
            :value="selectedBoldItalicFont"
            @input="v => setFont('boldItalic', v)"
            label="Bold italic"
            :loading="fontLoading"
          />

          <UiTextbox
            label="Override"
            :value="fontOverrides.boldItalic"
            @input="v => overrideCssFont('boldItalic', v)"
          />

          <FontSelect
            :fonts="fontOptions"
            :value="selectedHeaderFont"
            @input="v => setFont('header', v)"
            label="Header"
            :loading="fontLoading"
          />

          <UiTextbox
            label="Override"
            :value="fontOverrides.header"
            @input="v => overrideCssFont('header', v)"
          />
        </div>
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

    <UiModal ref="modal" title="Error opening fonts">
      <div class="error-modal-body">
        <p>{{ errorMessage }}</p>
        <p v-for="(log, i) in errorLogs" :key="i">
          <code><strong>{{ log.url }}:</strong> {{ log.error }}</code>
          </p>
      </div>
    </UiModal>

    <UiModal ref="modalAddFont" title="Add remote fonts">
      <div class="add-font-modal-body">
        <UiTextbox v-model="addFontUrl" @keydown.enter="addRemoteFont(addFontUrl)" ref="addFontUrlInput" placeholder="HTTPS-enabled URL (TTF, OTF, WOFF)">
        </UiTextbox>

        <div class="align-right">
          <UiButton @click="addRemoteFont(addFontUrl)" :disabled="!addFontUrl">Load</UiButton>
        </div>
      </div>
    </UiModal>
  </div>
</template>

<script>
import { mapGetters, mapState, mapActions } from "vuex";

import UiModal from "keen-ui/src/UiModal.vue";
import UiFileupload from "keen-ui/src/UiFileupload.vue";
import UiButton from "keen-ui/src/UiButton.vue";
import UiPopover from "keen-ui/src/UiPopover.vue";
import UiTooltip from "keen-ui/src/UiTooltip.vue";
import UiTextbox from "keen-ui/src/UiTextbox.vue";
import UiProgressLinear from "keen-ui/src/UiProgressLinear";

import FontSelect from "@/components/FontSelect.vue";
import FileDrop from "@/components/FileDrop.vue";

import LoadFontWorker from 'worker-loader!@/models/loadFont.worker.js';
import Font from "@/models/Font";

import styles from "@/utils/styles";
import DEFAULT_FONTS from "@/models/DEFAULT_FONTS.js";

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
    UiTextbox,
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
      "remoteFontRequested",
    ]),
    ...mapGetters([
      "settings",
      "selectedFont",
      "selectedBoldFont",
      "selectedItalicFont",
      "selectedBoldItalicFont",
      "selectedHeaderFont",
      "selectedSampleKey",
      "scripts",
      "languageSupport",
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
      lastFont: null,
      errorMessage: "",
      errorLogs: [],
      fontLoadingProgress: 0,
      openedWithoutFonts: true,
      defaultFontsLoaded: false,
      previousFont: null,
      fontOverrides: {
        regular: '',
        italic: '',
        bold: '',
        boldItalic: '',
        header: '',
      },
      addFontUrl: '',
    };
  },
  watch: {
    gui () {
      this.init();
    },
    remoteFontRequested(url) {
      this.navigateToTester();
      this.addRemoteFont(url);
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

    getQueryStringFontUrls() {
      const urls = this.$route.query.preload || [];
      return Array.isArray(urls) ? urls : [urls];
    },

    getDefaultFontUrls() {
      const dir = (process.env.BASE_URL + "/fonts/").replace(/\/+/g, "/");
      return DEFAULT_FONTS.map(f => dir + f);
    },

    loadDefaultFonts() {
      this.defaultFontsLoaded = true;
      let urls = this.getQueryStringFontUrls();
      if (!urls.length) urls = this.getDefaultFontUrls();
      this.loadFonts({ urls });
    },

    openAddFontDialog() {
      this.$refs.modalAddFont.open();
      setTimeout(() => {
          this.$refs.modalAddFont.$el.focus();
          this.$refs.modalAddFont.$el.querySelector('input').focus();
      }, 10)
    },
    addRemoteFont(url) {
      this.openedWithoutFonts = false;
      this.loadFonts({ urls: [ url || this.addFontUrl ], remote: true });
      this.addFontUrl = '';
      this.$refs.modalAddFont.close();
    },
    updateQuery(update) {
        let query = JSON.parse(JSON.stringify(this.$route.query));
        query = { ...query, ...update };
        this.$router.replace({ query });
    },

    onFilesDropped(files) {
      this.openedWithoutFonts = false;
      this.loadFonts({ files: Array.from(files) });
    },

    navigateToTester() {
      if (this.$route.path === "/") {
        this.$router.push({ query: this.$route.query, path: 'lettering' });
      }
    },

    loadFonts({ files = [], urls = [], remote = false } = {}) {
      if (!urls.length) {
        urls = files.map(file => URL.createObjectURL(file));
      }
      if (!urls.length) {
        return;
      }
      this.navigateToTester();
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
          const { font: opentypeFont, url, fileName } = e.data;
          const font = new Font(opentypeFont, url, fileName);
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
          const { error, url, fileName } = e.data;
          errors.push({ error, url, fileName });
          this.updateQuery({
            preload: this.getQueryStringFontUrls().filter(u => u !== url),
          });
        }

        if (i === urls.length) {
          let styleOrder = ['normal', 'italic', 'oblique'];
          if (fonts.length) {
            fonts.sort((a, b) =>
              a.family.localeCompare(b.family)
              || a.cssWeight - b.cssWeight
              || styleOrder.indexOf(a.cssStyle) - styleOrder.indexOf(b.cssStyle)
            );
            // don't make font objects reactive for performance gains
            this.fonts = Object.freeze([ ...fonts, ...this.fonts ]);

            let requestedFont = this.$route.query.f || '';
            let matchedFont = fonts.findIndex(f => f.family.toLowerCase().startsWith(requestedFont.toLowerCase()));
            this.selectFont(fonts[matchedFont === -1 ? 0 : matchedFont]);
            if (remote) this.updateQuery({
              preload: [ ...this.getQueryStringFontUrls(), ...urls ],
            });
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
        this.errorLogs = errors;
      } else {
        this.errorMessage = `An unexpected error occurred.`;
        this.errorLogs = [extraError];
      }
      this.$refs.modal.open();
    },

    getFont(fontOption) {
      const index = this.fonts.findIndex(f => f.displayName === fontOption.displayName);
      const font = this.fonts[index];
      const serialized = font.serialize();
      return { index, font: serialized };
    },

    selectFont(v) {
      this.lastFont = this.selectedFont;

      const { index, font } = this.getFont(v);
      this.selectedFontIndex = index;
      styles.setProperty("--selectedFontFamily", font.cssFamily);
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
      const matchingBoldItalic = waterfallFilter(this.fonts.slice(),
        f => f.family === v.family && f.cssWeight - v.cssWeight === 300 && f.cssStyle === "italic",
        f => f.family === v.family && f.cssWeight - v.cssWeight >= 200 && f.cssStyle === "italic",
        f => f.family === v.family && f.cssWeight - v.cssWeight > 0 && f.cssStyle === "italic",
        f => f.family === v.family && f.cssWeight - v.cssWeight === 0 && f.cssStyle === "italic",
        f => f.family === v.family && f.cssStyle === "italic",
        f => f.family === v.family && f.cssWeight <= v.cssWeight,
      )[0];

      this.selectBoldFont(matchingBold);
      this.selectHeaderFont(matchingBold);
      this.selectItalicFont(matchingItalic);
      this.selectBoldItalicFont(matchingBoldItalic);

      this.selectScripts({ values: this.scripts }); // reset selection to test all scripts
      const supportedScripts = this.languageSupport.includedCharactersByScript.filter(s => s.characters.length > 12).map(s => s.script);
      const scripts = this.scripts.filter(s => supportedScripts.indexOf(s.script) > -1);
      this.selectScripts({ values: scripts });
    },

    setFont(key, value) {
      const { font } = this.getFont(value);
      this.setCssFont(key, font.cssFamily);
      key = key === 'regular' ? 'font' : key + 'Font';
      this.$store.commit("selectFont", { [key]: font });
    },

    setCssFont(key, value) {
      const variable = {
        regular: "selectedFont",
        italic: "selectedItalicFont",
        bold: "selectedBoldFont",
        boldItalic: "selectedBoldItalicFont",
        header: "selectedHeaderFont",
      }[key];
      const cssVariable = '--' + variable + 'Family';
      if (value) {
        styles.setProperty(cssVariable, value);
      } else {
        styles.setProperty(cssVariable, this[variable].cssFamily);
      }
    },

    overrideCssFont(key, value) {
      const variable = {
        regular: "selectedFont",
        italic: "selectedItalicFont",
        bold: "selectedBoldFont",
        boldItalic: "selectedBoldItalicFont",
        header: "selectedHeaderFont",
      }[key];
      const cssFontVariable = '--' + variable + 'Family';
      const cssWeightVariable = '--' + variable + 'CssWeight';
      if (value) {
        const regex = /((Light|Semi-?bold|Bold|Heavy|Extra-?bold|Black|\d{1,3})? ?(Italic)?)$/i;
        const styleMatch= value.match(regex);
        if (styleMatch && styleMatch[0].length) {
          const family = value.replace(regex, '');
          const style = styleMatch[1];
          styles.setProperty(cssFontVariable, family);
          styles.setProperty(cssWeightVariable, style);
        }
        else {
          styles.setProperty(cssFontVariable, value);
        }
      } else {
        styles.setProperty(cssFontVariable, this[variable].cssFamily);
        styles.setProperty(cssWeightVariable, '');
      }
      this.fontOverrides[key] = value;
    },



    selectBoldFont(v) {
      const { font: boldFont } = this.getFont(v);
      styles.setProperty("--selectedBoldFontFamily", boldFont.cssFamily);
      this.$store.commit("selectFont", { boldFont });
    },

    selectItalicFont(v) {
      const { font: italicFont } = this.getFont(v);
      styles.setProperty("--selectedItalicFontFamily", italicFont.cssFamily);
      const same = this.selectedFont.cssFamily == italicFont.cssFamily;
      // styles.setProperty("--selectedItalicFontCssStyle", same ? 'italic' : this.selectedItalicFont.cssStyle);
      styles.setProperty("--selectedItalicFontCssStyle", same ? 'oblique' : this.selectedItalicFont.cssStyle);
      // styles.setProperty("--selectedItalicFontCssWeight", italicFont.cssWeight);
      // styles.setProperty("--selectedItalicFontCssStyle", italicFont.cssStyle);
      this.$store.commit("selectFont", { italicFont });
    },

    selectBoldItalicFont(v) {
      const { font: boldItalicFont } = this.getFont(v);
      styles.setProperty("--selectedBoldItalicFontFamily", boldItalicFont.cssFamily);
      const same = this.selectedFont.cssFamily == boldItalicFont.cssFamily;
      styles.setProperty("--selectedBoldItalicFontCssWeight", same ? 700 : this.selectedBoldItalicFont.cssWeight);
      // styles.setProperty("--selectedItalicFontCssStyle", same ? 'italic' : this.selectedBoldItalicFont.cssStyle);
      styles.setProperty("--selectedBoldItalicFontCssStyle", same ? 'oblique' : this.selectedBoldItalicFont.cssStyle);
      this.$store.commit("selectFont", { boldItalicFont });
    },

    selectHeaderFont(v) {
      const { font: headerFont } = this.getFont(v);
      styles.setProperty("--selectedHeaderFontFamily", headerFont.cssFamily);
      this.$store.commit("selectFont", { headerFont });
    },
    setLastFont() {
      if (this.lastFont && this.lastFont.family) {
        this.selectFont(this.lastFont);
      }
    },
    setPreviousFont() {
      this.selectFont(this.fonts[Math.max(0, this.selectedFontIndex - 1)]);
    },
    setNextFont() {
      this.selectFont(this.fonts[Math.min(this.fonts.length - 1, this.selectedFontIndex + 1)]);
    },
    ...mapActions([
      "selectScripts",
    ]),

    /* ^^^ methods ^^^ */
  },
};
</script>

<style lang="scss">
@import "@/scss/variables";
@import "@/scss/mixins";
@import "@/scss/dark";

.font-loader {
  flex: 1 1 $font-select-width;
  display: flex;
  align-items: center;

  .font-loader-item {
    margin: 0 2px;
  }

  .font-select {
    flex: 1 0 auto;
    width: 12em;
    .ui-select__display-value {
      white-space: nowrap;
    }
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
  .font-select {
    .ui-select__display {
      padding: 2px 8px;
      border-radius: 3px;
    }
    margin-bottom: 0;
  }



  @media (max-width: 1400px) {
    display: grid;
    gap: 3px;
    grid-template-columns: repeat(4, 1fr);
    .font-loader-item {
      margin: 0;
      flex: 1;
      > * {
        width: 100%;
      }
    }
    .font-select {
      width: 100%;
      grid-column-end: span 3;
    }
  }
}

.font-select-popover {
  padding: 8px;
  width: calc(#{2 * $font-select-width} + 16px);
}
.font-select-menu {
  display: grid;
  grid-template-columns: 1fr 1fr;
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

.ui-modal .ui-focus-container.ui-modal__container {
  top: 2em;
  bottom: 2em;
  max-height: calc(100vh - 4em);
}
.ui-modal .ui-button {
  margin-top: 1rem;
  margin-left: auto;
  margin-right: 0;
}
.add-font-modal-body {
  .align-right {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
