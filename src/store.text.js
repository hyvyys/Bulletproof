import Vue from "vue";
import router from "@/router";

import languageDataFields from "@/models/textKindLanguageDataField";
import LanguageData from "language-data";

let id = 0;
let customTextId = 1;

export default {
  state: {
    selectedSampleKey: "lettering",
    texts: [],
    customTextIds: [],
    languages: LanguageData.map(l => ({ ...l, id: id++, isSelected: true })),
    textHeadings: [],
    formatRequested: false,
  },

  mutations: {
    setText(state, { sampleKey, html }) {
      Vue.set(state.texts, sampleKey, html)
    },

    modifyText(state, { html, headings }) {
      if (state.selectedSampleKey in languageDataFields) {
        state.customTextIds.push(customTextId);
        state.texts[customTextId] = html;
        this.commit("selectSample", { kind: "custom", id: customTextId });
        router.push(`/custom/${state.selectedSampleKey}`);
        customTextId++;
      }
      else {
        state.texts[state.selectedSampleKey] = html;
      }
      state.textHeadings = headings;
    },

    removeCustomText(state, { id }) {
      const i = state.customTextIds.indexOf(id);
      state.customTextIds.splice(i, 1);
      delete state.texts[id];
      if (router.currentRoute.path === `/custom/${id}`) {
        router.push(`/lettering`);
      }
    },

    format(state, { tag }) {
      state.formatRequested = tag;
    },

    selectSample(state, { kind, id }) {
      if (kind in languageDataFields) {
        state.selectedSampleKey = kind;
      } else if (kind === "custom") {
        state.selectedSampleKey = id;
      }
    },

    selectLanguage(state, { id, checked }) {
      state.languages.find(l => l.id === id).isSelected = checked;
    },
  },

  actions: {
    selectLanguage({ state, commit, dispatch }, { id, checked }) {
      const matching = state.languages.find(l => l.id === id);
      if (matching.isSelected !== checked) {
        commit("selectLanguage", { id, checked });
        dispatch("updateText");
      }
    },

    selectSample({ commit, dispatch }, { kind, id }) {
      commit("selectSample", { kind, id });
      dispatch("updateText");
    },

    updateText({ state, commit, getters }) {
      const fieldKey = getters.selectedSampleTextKey;
      if (!fieldKey) {
        return;
      }
      const data = getters.selectedLanguages
        .map(l => ({
          language: l.language,
          id: `${l.language}-${l.id}`,
          texts: l[fieldKey],
        }));
      const html = data
        .map(({ language, id, texts }) => {
          let header, fragments;
          switch (getters.selectedSampleKey) {
            case "gotchas":
              header = `<h3 class="gotcha-heading" id="${ id }">${ language }</h3>`;
              fragments = texts.map(({ topic, tags, tests }) =>
                `<h4>${topic}</h4>${tests.map(t => `<p>${t}</p>`).join("")}`);
              break;
            default:
              header = `<h3 id="${ id }">${ language }</h3>`;
              fragments = texts.map(t =>`<p>${t}</p>`);
          }
          return header + fragments.join("");
        })
        .join("");
      commit("setText", { sampleKey: state.selectedSampleKey, html });
    },
  },

  getters: {
    texts: state => {
      return state.texts;
    },
    textHeadings: state => {
      return state.textHeadings;
    },
    formatRequested: state => {
      return state.formatRequested;
    },
    customTextIds: state => {
      return state.customTextIds;
    },
    selectedSampleKey: state => {
      return state.selectedSampleKey;
    },
    selectedSampleTextKey: state => {
      return languageDataFields[state.selectedSampleKey];
    },
    languages: state => {
      return state.languages;
    },
    filteredLanguages: state => {
      return state.languages.filter(l => l);
    },
    visibleLanguages: (state, getters) => {
      if (getters.selectedSampleTextKey) {
        return getters.filteredLanguages
        .filter(l => l[getters.selectedSampleTextKey].length);
      }
      else {
        return [];
      }
    },
    selectedLanguages: (state, getters) => {
      return getters.visibleLanguages.filter(l => l.isSelected);
    },
  },
}
