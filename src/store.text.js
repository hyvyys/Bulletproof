import Vue from "vue";
import router from "@/router";

import kerningPatterns from "@/models/kerningPatterns";
import kerningPatternId from "@/models/kerningPatternId";
import languageDataFields from "@/models/textKindLanguageDataField";
import LanguageData from "language-data";
import escapeHtmlId from "./utils/escapeHtmlId";
import escapeHtml from "./utils/escapeHtml";
import CharacterFilter from "./models/CharacterFilter";
import KerningGenerator from "./models/KerningGenerator";

let id = 0;
let customTextId = 1;

export default {
  state: {
    selectedSampleKey: "",
    texts: [],
    customTextIds: [],
    languages: LanguageData.map(l => ({ ...l, id: id++, isSelected: true })),
    textHeadings: [],
    formatRequested: false,
    kerningPatterns: [],
    defaultKerningPatterns: kerningPatterns,
  },

  mutations: {
    setText(state, { sampleKey, html }) {
      Vue.set(state.texts, sampleKey, html)
    },

    modifyText(state, { html, headings = [] }) {
      if (state.selectedSampleKey in languageDataFields) {
        this.commit("addCustomText", { html });
      }
      else {
        Vue.set(state.texts, state.selectedSampleKey, html);
        // state.texts[state.selectedSampleKey] = html;
      }
      state.textHeadings = headings;
    },

    addCustomText(state, { html }) {
      state.customTextIds.push(customTextId);
      state.texts[customTextId] = html;
      this.commit("selectSample", { kind: "custom", id: customTextId });
      const route = `/custom/${state.selectedSampleKey}`;
      if (router.currentRoute.path !== route) {
        router.push(route);
      }
      customTextId++;
    },

    removeCustomText(state, { id }) {
      const i = state.customTextIds.indexOf(id);
      state.customTextIds.splice(i, 1);
      delete state.texts[id];
      if (router.currentRoute.path === `/custom/${id}`) {
        let path = '/lettering';
        if (i < state.customTextIds.length) {
          id = state.customTextIds[i];
          path = `/custom/${id}`;
        } else if (i - 1 >= 0 && i - 1 < state.customTextIds.length) {
          id = state.customTextIds[i - 1];
          path = `/custom/${id}`;
        }
        router.push(path);
      }
    },

    format(state, { tag }) {
      state.formatRequested = tag;
    },

    selectSample(state, { kind, id }) {
      if (kind in languageDataFields) {
        state.selectedSampleKey = kind;
      } else if (kind === "custom") {
        if (id in state.texts) {
          state.selectedSampleKey = id;
        }
        else {
          const html = "Type here";
          this.commit("addCustomText", { html });
        }
      }
    },

    selectLanguage(state, { id, checked }) {
      state.languages.find(l => l.id === id).isSelected = checked;
    },

    clearKerningPatterns(state) {
      state.kerningPatterns.splice(0);
      this.commit("setText", { sampleKey: "kerning", html: "" });
    },

    initKerningPatterns(state) {
      state.defaultKerningPatterns.forEach(({ segments, isVisible = true }) => {
        this.commit("addKerningPattern", { segments, isVisible });
      });
    },

    addKerningPattern(state, { segments, isVisible }) {
      const { sets, closures } = KerningGenerator.sets(segments);

      const id = kerningPatternId(segments)
      const copy = state.kerningPatterns.slice();
      copy.push({ id, sets, closures, isVisible });
      state.kerningPatterns = copy;
    },

    removeKerningPattern(state, { id }) {
      const index = state.kerningPatterns.findIndex(p => p.id === id);
      state.kerningPatterns.splice(index, 1);
    },

    toggleKerningPattern(state, { id, on }) {
      const index = state.kerningPatterns.findIndex(p => p.id === id);
      state.kerningPatterns[index].isVisible = on;
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

    updateText({ state, commit, getters, dispatch }) {
      if (state.selectedSampleKey === "kerning") {
        if (state.kerningPatterns.length === 0) {
          commit("initKerningPatterns");
        }
        dispatch("updateKerning");
        return;
      }
      const fieldKey = getters.selectedSampleTextKey;
      if (!fieldKey) {
        return;
      }
      const data = getters.selectedLanguages
        .map(l => ({
          languageTag: l.htmlTag,
          language: l.language,
          script: l.script,
          id: `${l.language}-${l.id}`,
          texts: l[fieldKey],
        }));

      function squish(str) { return str.replace(/\s\s+/g, "") }

      const html = data
        .map(({ language, languageTag, id, texts, script }) => {
          let header, fragments;
          switch (getters.selectedSampleKey) {
            case "gotchas":
              header = `<h3 id="${id}">${language}</h3>`;
              fragments = texts.map(({ topic, tags, tests, description }) =>
                squish(
                  `<div class="header">
                    <h4>${topic}</h4>
                    <div class="tags">${tags.map(t => `<span>${t}</span>`).join("")}</div>
                  </div>`
                ) +
                `<div class="desc">${description || ''}</div>` +
                squish(
                  `<div lang="${languageTag}">
                    ${tests.map(t => `<p>${t}</p>`).join("")}
                  </div>`
                )
              );
              break;
            case "kerning":
              break;
            case "ABCs": {
              const AaBbCc = texts;
              const ABC = CharacterFilter.filter(AaBbCc, g => g.toUpperCase() === g)
                .replace(/ +/g, " ").trim();
              const abc = CharacterFilter.filter(AaBbCc, g => g.toLowerCase() === g)
                .replace(/ +/g, " ").trim();

              header = `<h3 id="${id}">${language}</h3>`;
              fragments = [
                // AaBbCc,
                // ABC,
                // abc,
                AaBbCc.replace(/ /g, ""),
                ABC.replace(/ /g, ""),
                abc.replace(/ /g, ""),
              ];
              if (script == 'Latn') {
                const accents = CharacterFilter.filter(abc, g => !/^[a-z ]$/.test(g));
                fragments.push(accents);
              }

              fragments = fragments.map(t => `<p>${t}</p>`);
              break;
            }
            default:
              header = `<h3 id="${id}">${language}</h3>`;
              if (texts instanceof Array)
                fragments = texts.map(t => `<p>${t}</p>`);
              else
                fragments = [texts].map(t => `<p>${t}</p>`);
          }
          return header + fragments.join("");
        })
        .join("");
      commit("setText", { sampleKey: state.selectedSampleKey, html });
    },

    updateKerning({ state, commit }) {
      let patterns = state.kerningPatterns
        .filter(pattern => pattern.isVisible);
      let html = patterns
        .map(pattern => {
          const lines = KerningGenerator.kerningString(pattern);
          return `<h6 id="${escapeHtmlId(pattern.id)}"></h6>`
            + `<p>${escapeHtml(lines.join("\n"))}</p>`;
        })
        .join("");
      commit("setText", { sampleKey: "kerning", html });
    },

    addKerningPattern({ dispatch, commit }, { segments }) {
      commit("addKerningPattern", { segments, isVisible: true });
      dispatch("updateKerning");
    },

    removeKerningPattern({ dispatch, commit }, { id }) {
      commit("removeKerningPattern", { id });
      dispatch("updateKerning");
    },

    toggleKerningPattern({ dispatch, commit }, { id, on }) {
      commit("toggleKerningPattern", { id, on });
      dispatch("updateKerning");
    },

    resetKerningPatterns({ dispatch, commit }) {
      commit("clearKerningPatterns");
      setTimeout(() => {
        dispatch("updateText");
      }, 50);
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
    kerningPatterns: (state) => {
      return state.kerningPatterns;
    },
  },
}
