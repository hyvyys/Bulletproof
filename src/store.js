import Vue from "vue";
import Vuex from 'vuex';
Vue.use(Vuex);

import LanguageData from "language-data";
import Settings from "@/models/Settings";
import computedParams from "@/models/computedParams";
import convertLength from "@/models/convertLength";
import opentypeFeatureDefaults from "@/models/opentypeFeatureDefaults";

export default new Vuex.Store({
  state: {
    selectedFont: { family: "" },
    settings: Settings.getDefaults(),
    selectedSampleKey: "lettering",
    selectedLanguages: LanguageData.map(l => l.language),
    scrolledParentSelector: ".app-content",
  },

  getters: {
    selectedFont: state => {
      return state.selectedFont;
    },
    settings: state => {
      return state.settings;
    },
    scrolledParentSelector: state => {
      return state.scrolledParentSelector;
    },
  },

  mutations: {
    selectFont(state, { font }) {
      state.selectedFont = font;
      this.commit("mapFontFeatureSettings");
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
            to.push({ ...f, value: opentypeFeatureDefaults.indexOf(f.tag) > -1, active: true });
          }
          else {
            matching.active = true;
            matching.friendlyName = f.friendlyName;
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
