import Vue from "vue";
import Vuex from 'vuex';
Vue.use(Vuex);

import textModule from "./store.text";
import animationModule from "./store.animation";
import configureMediator from "./store-mediator";

import Settings from "@/models/Settings";
import computedParams from "@/models/computedParams";
import convertLength from "@/models/convertLength";
import opentypeFeatureDefaults from "@/models/opentypeFeatureDefaults";

const store = new Vuex.Store({
  modules: {
    text: textModule,
    animation: animationModule,
  },
  state: {
    fontLoading: true,
    selectedFont: { family: "" },
    selectedBoldFont: { family: "" },
    selectedItalicFont: { family: "" },
    settings: Settings.getDefaults(),
    scrolledParentSelector: ".app-content",
    animating: false,
    displayedSettings: {},
    settingsPanelVisible: true,
    contextualPanelVisible: false,
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
    displayedSettings: state => {
      return state.animating ? state.displayedSettings : state.settings;
    },
    animating: state => state.animating,
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
    fontFeatureSettings: state => {
      return Settings.getStyleFromSettings(state.settings).fontFeatureSettings;
    },
    fontVariationSettings: state => {
      return Settings.getStyleFromSettings(state.settings).fontVariationSettings;
    },
  },

  mutations: {
    toggleSettingsPanel(state, { value } = { value: null }) {
      const val = value != null ? value : !state.settingsPanelVisible;
      state.settingsPanelVisible = val;
    },
    toggleContextualPanel(state, { value } = { value: null }) {
      const val = value != null ? value : !state.contextualPanelVisible;
      state.contextualPanelVisible = val;
    },

    fontLoadStart(state) {
      state.fontLoading = true;
    },

    fontLoadEnd(state) {
      state.fontLoading = false;
    },

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
          f.active = false; // change to getter maybe
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
      this.commit("updateSetting");
    },

    updateGsubFeature(state, { tag, value }) {
      const features = state.settings.gsubFeatures;
      const matching = features.find(f => f.tag === tag);
      if (matching) {
        matching.value = value;
      }
      this.commit("updateSetting");
    },

    updateLoclFeature(state, { selectedLanguage }) {
      const features = state.settings.gsubFeatures;
      const matching = features.find(f => f.tag === "locl");
      if (matching) {
        matching.selectedLanguage = selectedLanguage;
      }
      this.commit("updateSetting");
    },

    mapFontVariationSettings(state) {
      const font = state.selectedFont;
      state.settings.variationAxes = font.variationAxes.map(a => {
        const matching = state.settings.variationAxes.find(aa => aa.tag === a.tag);
        return {
          ...a,
          value: matching ? matching.value : a.defaultValue,
          displayName: a.name.en,
        };
      });
    },

    updateVariationAxis(state, { tag, value }) {
      const axis = state.settings.variationAxes.find(a => a.tag === tag);
      if (axis) {
        axis.value = value;
      }
      this.commit("updateSetting");
    },

    resetSettings(state) {
      //todo add font-specific settings
      const settings = Settings.getDefaults();
      Object.keys(settings).forEach(key => state.settings[key] = settings[key]);
      this.commit("computeParams");
      this.commit("updateSetting");
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
        const settings = state.settings;
        const definition = Settings.definitions[key];
        const value = options[key];
        if (!definition.validate || definition.validate(value, settings)) {
          if (key == "fontSizeUnit") {
            this.commit("convertFontSize", { newUnit: value });
          }
          state.settings[key] = value;
          this.commit("updateSetting");
        }
        else {
          // eslint-disable-next-line no-console
          console.log(`${value} is invalid for ${key}`)
        }
      });
      this.commit("computeParams");
    },

    restoreSettings(state, { snapshot }) {
      state.settings = snapshot;
      this.commit("mapFontFeatureSettings");
      this.commit("mapFontVariationSettings");
    },

    animateSettings(state, { settings }) {
      if (settings) {
        state.animating = true;
        Object.keys(settings).forEach(k => {
          Vue.set(state.displayedSettings, k, settings[k]);
        });
      }
      else {
        state.animating = false;
      }
    },

    updateSetting() {
      // signalize update to subscriber
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
    fontLoadStart({ commit }) {
      commit("fontLoadStart");
    },

    fontLoadEnd({ commit }) {
      commit("fontLoadEnd");
    },
  },
})

configureMediator(store);

export default store;
