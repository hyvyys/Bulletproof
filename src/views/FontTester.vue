<template>
  <div class="font-tester">
    <Fitter
      class="settings-wrapper"
      :scrolledParentSelector="scrolledParentSelector"
      bottomSelector=".site-footer"
      topSelector=".site-header"
    >
      <Settings />
    </Fitter>
    <FontSample
      :html="texts[selectedSampleKey]"
      @update="v => updateText(selectedSampleKey, v)"
    />
  </div>
</template>

<script>
import LanguageData from "language-data";

import { mapGetters } from "vuex";

import languageDataFields from "@/models/textKindLanguageDataField";
import textKinds from "@/models/textKinds";

import FontSample from "@/components/FontSample.vue";
import Settings from "@/components/Settings.vue";
import Fitter from "@/components/layout/Fitter.vue";

export default {
  name: "FontTester",
  components: {
    Fitter,
    Settings,
    FontSample,
  },
  data() {
    return {
      texts: {
        custom: "lorem ipsum dolor ".repeat(1000),
      },
      selectedSampleKey: "lettering",
      selectedLanguages: LanguageData.map(l => l.language),
    };
  },
  computed: {
    selectedTextKind() {
      return this.$route.params.text;
    },
    ...mapGetters(["scrolledParentSelector"]),
  },
  watch: {
    selectedTextKind(kind) {
      this.selectSample(kind);
    },
  },
  beforeMount() {
    this.$store.commit("resetSettings");
    this.selectSample(this.selectedTextKind);
    this.updateTexts();
  },
  mounted() {
  },
  methods: {
    // mergeFontFeatureSettings() {
    //   const obj = Object.assign(this.settings.fontFeatureSettings, {});
    //   const features = [...this.font.gposFeatures, ...this.font.gsubFeatures];
    //   features.forEach(f => {
    //     if (!(f.tag in obj)) {
    //       obj[f.tag] = false;
    //     }
    //   });
    //   this.settings.fontFeatureSettings = obj;

    // },
    selectSample(kind, id) {
      if (kind in languageDataFields) {
        this.selectedSampleKey = kind;
      } else if (kind === "custom") {
        this.selectedSampleKey = id;
      }
    },
    updateTexts() {
      textKinds.forEach(kind => {
        this.updateText(kind);
      });
    },
    updateText(sampleKey, value) {
      const fieldKey = languageDataFields[sampleKey];
      if (fieldKey) {
        if (typeof value !== "undefined") {
          this.texts[sampleKey] = value;
        } else {
          const data = LanguageData.map(entry => ({
            language: entry.language,
            texts: entry[fieldKey],
          })).filter(entry => entry.texts.length);
          const html = data
            .map(
              ({ language, texts }) =>
                `<h3>${language}</h3>${texts.map(t => `<p>${t}</p>`).join("")}`
            )
            .join("");
          this.texts[sampleKey] = html;
        }
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/scss/variables";

.font-tester {
  // background: $light;
  flex: 1;
  display: flex;
  height: 100vh;
}
.settings-wrapper {
  min-width: $sidebar-width;
  width: $sidebar-width;
}
</style>
