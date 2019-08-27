<template>
  <div class="font-loader">
    <UiSelect
      v-if="gui"
      class="font-select dark"
      v-model="selectedFont"
      :keys="fontOptionKeys"
      :options="fonts"
    >
      <div slot="option" slot-scope="props" :style="optionStyle">
        <div class="font-family">{{ props.option && props.option.family }}</div>
        <div
          class="font-family-sample"
          :style="optionSampleStyle(props.option)"
        >{{ props.option && sampleText }}</div>
      </div>
    </UiSelect>

    <FileDrop @files-dropped="files => loadFonts({files})" />
  </div>
</template>

<script>
import UiSelect from "keen-ui/src/UiSelect.vue";

import eventBus from "@/eventBus";

import FileDrop from "@/components/FileDrop.vue";
import FontParser from "@/models/FontParser";
import styles from "@/utils/styles";
import { Promise } from "q";

export default {
  name: "FontTester",
  components: {
    FileDrop,
    UiSelect,
  },
  props: {
    gui: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      fontOptionKeys: {
        class: "class",
        label: "family",
        image: "image",
      },
      selectedFont: { family: "" },
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
    };
  },
  computed: {},
  watch: {
    selectedFont() {
      this.updateFont();
    },
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
    async loadFonts({ files = [], urls = [] } = {}) {
      if (!urls.length) urls = files.map(file => URL.createObjectURL(file));

      Promise.all(urls.map(url => FontParser.parse(url)))
        .then(fonts => {
          fonts.forEach(font => {
            this.fonts.push(font);
            styles.add(font.fontFace);
          });
          this.selectedFont = fonts[0];
          // this.selectFont()
        })
        .catch(error => {
          console.log(error);
        });
    },

    updateFont() {
      eventBus.$emit("font-change", this.selectedFont.family);
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
        mix-blend-mode: hard-light;
        background: rgba(#333, 0.8);
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