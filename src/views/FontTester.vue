<template>
  <div class="font-tester">
    <Fitter
      class="settings-wrapper"
      scrolledParentSelector=".app > div"
      bottomSelector=".site-footer"
      topSelector=".site-header"
    >
      <Settings v-bind.sync="settings" />
    </Fitter>
    <FontSample
      :html="texts[selectedSampleKey]"
      v-bind="settings"
      @update="v => updateText(selectedSampleKey, v)"
    />
  </div>
</template>

<script>
import LanguageData from "language-data";

import eventBus from "@/eventBus";

import languageDataFields from "@/models/textKindLanguageDataField";
import textKinds from "@/models/textKinds";
import settings from "@/models/settings";

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
      settings: this.getDefaultSettings(),
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
  },
  watch: {
    selectedTextKind(kind) {
      this.selectSample(kind);
    },
  },
  beforeMount() {
    this.selectSample(this.selectedTextKind);
    this.updateTexts();
  },
  mounted() {
    eventBus.$on("font-change", (fontFamily) => {
      this.settings.fontFamily = fontFamily;
    });
  },
  methods: {
    getDefaultSettings() {
      const data = {};
      Object.keys(settings).forEach(key => {
        data[key] = settings[key].default;
      });
      return data;
    },
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
