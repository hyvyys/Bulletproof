import Vue from "vue";
import Vuex from 'vuex';
Vue.use(Vuex);

import textModule from "./store.text";

import Settings from "@/models/Settings";
import computedParams from "@/models/computedParams";
import convertLength from "@/models/convertLength";
import opentypeFeatureDefaults from "@/models/opentypeFeatureDefaults";

export default new Vuex.Store({
  modules: {
    text: textModule,
  },
  state: {
    selectedFont: { family: "" },
    selectedBoldFont: { family: "" },
    selectedItalicFont: { family: "" },
    settings: Settings.getDefaults(),
    scrolledParentSelector: ".app-content",
  },

  getters: {
    selectedFont: state => {
      return state.selectedFont;
    },
    selectedBoldFont: state => {
      return state.selectedBoldFont;
    },
    selectedItalicFont: state => {
      return state.selectedItalicFont;
    },
    settings: state => {
      return state.settings;
    },
    scrolledParentSelector: state => {
      return state.scrolledParentSelector;
    },
    selectedLoclLanguage: state => {
      const features = state.settings.gsubFeatures;
      const matching = features.find(f => f.tag === "locl");
      if (matching && matching.value) {
        return matching.selectedLanguage.htmlTag;
      }
      return "";
    },
  },

  mutations: {
    selectFont(state, { font, boldFont, italicFont }) {
      if (font) {
        state.selectedFont = font;
        this.commit("mapFontFeatureSettings");
        this.commit("mapFontVariationSettings");
      }
      if (boldFont) {
        state.selectedBoldFont = boldFont;
      }
      if (italicFont) {
        state.selectedItalicFont = italicFont;
      }
    },

    mapFontFeatureSettings(state) {
      const font = state.selectedFont;
      function mergeFeatures(key) {
        const from = font[key], to = state.settings[key];

        to.forEach(f => {
          f.active = false;
        });
        from.forEach(f => {
          const matching = to.find(ff => ff.tag === f.tag);
          if (!matching) {
            to.push({
              ...f,
              value: opentypeFeatureDefaults.indexOf(f.tag) > -1,
              active: true,
            });
          }
          else {
            matching.active = true;
            if (f.tag === "locl") {
              matching.languages = f.languages;
            }
            else if (/ss\d\d/.test(f.tag)) {
              matching.friendlyName = f.friendlyName;
            }
          }
        });
      }
      mergeFeatures("gsubFeatures");
      mergeFeatures("gposFeatures");
    },

    updateGposFeature(state, { tag, value }) {
      const features = state.settings.gposFeatures;
      const matching = features.find(f => f.tag === tag);
      if (matching) {
        matching.value = value;
      }
    },

    updateGsubFeature(state, { tag, value }) {
      const features = state.settings.gsubFeatures;
      const matching = features.find(f => f.tag === tag);
      if (matching) {
        matching.value = value;
      }
    },

    updateLoclFeature(state, { selectedLanguage }) {
      const features = state.settings.gsubFeatures;
      const matching = features.find(f => f.tag === "locl");
      if (matching) {
        matching.selectedLanguage = selectedLanguage;
      }
    },

    mapFontVariationSettings(state) {
      const font = state.selectedFont;
      state.settings.variationAxes = font.variationAxes.map(a => ({
        ...a,
        value: a.defaultValue,
        displayName: a.name.en,
      }));
    },

    updateVariationAxis(state, { tag, value }) {
      const axis = state.settings.variationAxes.find(a => a.tag === tag);
      if (axis) {
        axis.value = value;
      }
    },

    resetSettings(state) {
      //todo add font-specific settings
      const settings = Settings.getDefaults();
      Object.keys(settings).forEach(key => state.settings[key] = settings[key]);
      this.commit("computeParams");
    },

    computeParams(state) {
      Object.keys(computedParams).forEach(key => {
        const paramFunction = computedParams[key];
        const newValue = paramFunction.call(state.settings);
        if (newValue !== state.settings[key]) {
          state.settings[key] = newValue;
        }
      });
    },

    updateSettings(state, options) {
      Object.keys(options).forEach(key => {
        this.commit("updateSetting", { key, value: options[key] })
      });
      this.commit("computeParams");
    },

    updateSetting(state, { key, value }) {
      const settings = state.settings;
      const definition = Settings.definitions[key];

      if (!definition.validate || definition.validate(value, settings)) {
        if (key == "fontSizeUnit") {
          this.commit("convertFontSize", { newUnit: value });
        }
        settings[key] = value;
      }
      else {
        // eslint-disable-next-line no-console
        console.log(`${value} is invalid for ${key}`)
      }
    },

    convertFontSize(state, { newUnit }) {
      const settings = state.settings;
      let decimals = String(settings.fontSizeStep).replace(/\d+\.?/, "").length;
      let newSize = convertLength({
        value: settings.fontSize,
        from: settings.fontSizeUnit,
        to: newUnit,
        decimals,
      });
      settings.fontSize = parseFloat(newSize);
    },
  },


  actions: {

  },
})
