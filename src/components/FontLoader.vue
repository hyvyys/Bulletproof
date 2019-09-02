<template>
  <div class="font-loader">
    <UiSelect
      v-if="gui"
      class="font-select dark"
      :value="selectedFont"
      @input="selectFont"
      :options="fonts"
      :keys="fontOptionKeys"
    >
      <div slot="option" slot-scope="props" :style="optionStyle">
        <div class="font-family">{{ props.option && props.option.family }}</div>
        <div
          class="font-family-sample"
          :style="optionSampleStyle(props.option)"
        >{{ props.option && sampleText }}</div>
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
      sampleText: "Abg123",
      optionStyle: `
        display: flex;
        align-items: baseline;
        width: 100%;
        `,
      optionSampleStyle: option => `
        flex: 1;
        font-family: ${option.family};
        font-weight: normal;
        text-align: right;
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
            this.fonts.push(font);
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

  .option {
    display: flex;
    .font-family-sample {
      flex: 1;
    }
  }
}
</style>
