import Vue from "vue";
import Vuex from 'vuex';
Vue.use(Vuex);

import LanguageData from "language-data";
import Settings from "@/models/Settings";
import computedParams from "@/models/computedParams";
import convertLength from "@/models/convertLength";

export default new Vuex.Store({
  state: {
    selectedFont: { family: "" },
    settings: {},
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
    },

    resetSettings(state) {
      //todo add font-specific settings
      state.settings = Settings.getDefaults();
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
      const definition = settingDefinitions[key];
      const oldValue = settings[key];

      if (!definition.validate || definition.validate(value, settings)) {
        if (key == "fontSizeUnit") {
          this.commit("convertFontSize", { newUnit: value });
        }
        settings[key] = value;
      }
      else {
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
