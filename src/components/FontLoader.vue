<template>
  <div class="font-loader">
    <FontSelect
      class="dark"
      v-if="gui"
      :fonts="fonts"
      :value="selectedFont"
      @input="selectFont"
    />

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
      fonts: [],
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

</style>
