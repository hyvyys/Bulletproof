<template>
  <div class="font-loader">
    <UiSelect
      v-if="gui"
      class="font-select dark"
      :value="selectedFont"
      @input="selectFont"
      :options="fonts"
      :keys="fontOptionKeys"
      dropdownClass="font-loader__dropdown"
      @dropdown-open="onSelectOpen"
    >
      <div slot="option" slot-scope="props">
        <div class="col col-sample">
          <div
            class="font-family-sample fit"
            :style="optionSampleStyle(props.option)"
          >{{ props.option && sampleText }}</div>
        </div>
        <div class="col">
          <div class="font-family">{{ props.option && props.option.originalFamily }}</div>
          <div class="font-style">{{ props.option && props.option.style }}</div>
          <div class="font-version">
            {{
            props.option && props.option.version
            ? `(${props.option.version})` : ""
            }}
          </div>
        </div>
      </div>
    </UiSelect>

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
import textFit from "textfit";

import UiModal from "keen-ui/src/UiModal.vue";
// import UiSelect from "keen-ui/src/UiSelect.vue";
import UiSelect from "@/components/UiSelect.vue";

import FileDrop from "@/components/FileDrop.vue";
import Fireworks from "@/components/Fireworks.vue";

import FontParser from "@/models/FontParser";

import styles from "@/utils/styles";
import { Promise } from "q";

export default {
  name: "FontTester",
  components: {
    UiSelect,
    UiModal,
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
    ...mapGetters(["selectedFont"]),
  },
  data() {
    return {
      fontOptionKeys: {
        class: "class",
        label: "family",
        image: "image",
      },
      fonts: [],
      sampleText: "Abg",
      optionSampleStyle: option => `
        font-family: ${option.family};
        font-style: ${option.cssStyle};
        font-weight: ${option.cssWeight};
        `,
      errorMessage: "",
      errorLogs: [],
    };
  },
  beforeMount() {
    const dir = "/fonts/";
    const fonts = [
      "alegreya-sans/alegreya-sans-v10-latin-ext_cyrillic_cyrillic-ext_latin_vietnamese_greek-ext_greek-regular.ttf",
      "Rywalka-Regular.ttf",
    ];
    this.loadFonts({ urls: fonts.map(f => dir + f) });
  },
  methods: {
    onSelectOpen() {
      setTimeout(() => {
        let els = document.querySelectorAll('.fit');
        // console.log('fit', els.length)
        textFit(els);
      }, 100);
    },
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
          const addedFonts = [];

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
            addedFonts.push(font.serialize());
            styles.add(font.fontFace);
          });
          this.fonts.unshift.apply(this.fonts, addedFonts);
          if (fonts.length) {
            this.selectFont(addedFonts[0]);
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

    selectFont(v) {
      this.$store.commit("selectFont", { font: v });
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
      @include pseudo();
      &::before {
        z-index: -1;
        // mix-blend-mode: hard-light;
        background: rgba(#211, 0.8);
        border-radius: 3px;
        box-shadow: inset 0 0 5px #000;
        pointer-events: none;
      }
      padding: 2px 8px;
      width: 10em;
      border-radius: 3px;
    }
    margin-bottom: 0.1em;
  }
}

.font-loader__dropdown {
  width: 250px !important;

  .ui-select-option {
    > div {
      // option
      display: flex;
      align-items: center;
      width: 100%;

      > :not(:last-child) {
        margin-right: 0.3ch;
      }

      .col {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        &:nth-child(2) {
          flex: 1;
        }
        > :not(:last-child) {
          margin-right: 0.3ch;
        }

        &.col-sample {
          margin-left: -0.5em;
          margin-right: 0.45em;
          .font-family-sample {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 1.75rem;
            height: 1.5rem;
            line-height: 0.5;
          }
        }
        .font-style {
          opacity: 0.6;
        }
        .font-version {
          flex-grow: 1;
          text-align: right;
        }
      }
    }
  }
}
</style>
