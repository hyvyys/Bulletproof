<template>
  <div class="font-loader">
    <UiSelect
      v-if="gui"
      class="font-select dark"
      :value="fonts[selectedFontIndex]"
      :options="fonts"
    />
    <FileDrop @files-dropped="loadFonts" />
  </div>
</template>

<script>
var opentype = require("opentype.js");
import util from "util";
const loadFont = util.promisify(opentype.load);

import UiSelect from "keen-ui/src/UiSelect.vue";

import FileDrop from "@/components/FileDrop";

export default {
  name: "FontTester",
  components: {
    FileDrop,
    UiSelect
  },
  props: {
    gui: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      selectedFontIndex: 0,
      fonts: ["Alegreya Sans"]
    };
  },
  computed: {},
  watch: {},
  beforeMount() {},
  methods: {
    async loadFonts(files) {
      let first = true;
      for (let file of files) {
        let url = URL.createObjectURL(file);
        await loadFont(url)
          .then(font => {
            // processFont(font, url);
            // if (first) {
            //   fontSelect.selectedIndex = fontSelect.options.length - 1;
            //   fireEvent(fontSelect, "change");
            //   first = false;
            // }
            console.log(font);
          })
          .catch(err => {
            // console.error("Font could not be loaded: " + err);
          });
      }
    }
  }
};
</script>

<style lang="scss">
@import "@/scss/variables";
@import "@/scss/mixins";

.font-loader {
  @include flex();

  .ui-select.font-select {
    margin-bottom: .75em;
  }
}
</style>
