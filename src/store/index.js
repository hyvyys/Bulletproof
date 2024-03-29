import Vue from "vue";
import Vuex from 'vuex';
Vue.use(Vuex);

import textModule from "./store.text";
import animationModule from "./store.animation";
import layoutModule from "./store.layout";
import configureMediator from "./store-mediator";

import Settings from "@/models/Settings";
import computedParams from "@/models/computedParams";
import convertLength from "@/models/convertLength";
import opentypeFeatureDefaults from "@/models/opentypeFeatureDefaults";

const store = new Vuex.Store({
  modules: {
    text: textModule,
    animation: animationModule,
    layout: layoutModule,
  },
  state: {
    fontLoading: true,
    selectedFont: { family: "" },
    selectedBoldFont: { family: "" },
    selectedItalicFont: { family: "" },
    selectedBoldItalicFont: { family: "" },
    selectedHeaderFont: { family: "" },
    settings: Settings.getDefaults(),
    animating: false,
    displayedSettings: {},
    settingsPanelVisible: true,
    contextualPanelVisible: false,
    expandedMenu: null,
    isMobile: false,
    remoteFontRequested: false,
  },

  getters: {
    selectedFont: state => {
      return state.selectedFont;
    },
    selectedHeaderFont: state => {
      return state.selectedHeaderFont;
    },
    selectedBoldFont: state => {
      return state.selectedBoldFont;
    },
    selectedItalicFont: state => {
      return state.selectedItalicFont;
    },
    selectedBoldItalicFont: state => {
      return state.selectedBoldItalicFont;
    },
    settings: state => {
      return state.settings;
    },
    displayedSettings: state => {
      return state.animating ? state.displayedSettings : state.settings;
    },
    animating: state => state.animating,
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
    fontWeight: state => {
      return Settings.getStyleFromSettings(state.settings).fontWeight;
    },
    fontStyle: state => {
      return Settings.getStyleFromSettings(state.settings).fontStyle;
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
    expandMenu(state, { menuId }) {
      if (state.expandedMenu === menuId) {
        state.expandedMenu = null;
      } else {
        this.commit("toggleContextualPanel", { value: false });
        this.commit("toggleSettingsPanel", { value: false });
        state.expandedMenu = menuId;
      }
    },
    setMobile(state, { isMobile }) {
      state.isMobile = isMobile;
    },

    requestFont(state, { url }) {
      state.remoteFontRequested = url;
    },

    fontLoadStart(state) {
      state.fontLoading = true;
    },

    fontLoadEnd(state) {
      state.fontLoading = false;
    },

    selectFont(state, { font, boldFont, italicFont, boldItalicFont, headerFont }) {
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
      if (boldItalicFont) {
        state.selectedBoldItalicFont = boldItalicFont;
      }
      if (headerFont) {
        state.selectedHeaderFont = headerFont;
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
            matching.uiName = f.uiName;
            if (f.tag === "locl") {
              matching.languages = f.languages;
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
          enabled: matching ? matching.enabled : true,
          displayName: a.displayName,
        };
      });
    },

    updateVariationAxis(state, { tag, value, enabled }) {
      const axis = state.settings.variationAxes.find(a => a.tag === tag);
      if (axis) {
        if (value != null) {
          axis.value = value;
        }
        if (enabled != null) {
          axis.enabled = enabled;
        }
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
        const value = options[key];
        if (key == "fontSizeUnit") {
          this.commit("convertFontSize", { newUnit: value });
        }
        state.settings[key] = value;
        this.commit("updateSetting");
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
