import Vue from "vue";
import router from "@/router";

import characterRange from "@/utils/characterRange";
import cartesianProduct from "@/utils/cartesianProduct";
import kerningPatterns from "@/models/kerningPatterns";
import kerningPatternId from "@/models/kerningPatternId";
import languageDataFields from "@/models/textKindLanguageDataField";
import LanguageData from "language-data";
import escapeHtmlId from "./utils/escapeHtmlId";
import escapeHtml from "./utils/escapeHtml";

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
      const sets = [];
      let closures = [];

      segments.forEach(s => {
        if (/^@/.test(s)) {
          s = s.replace(/^@/, "");
          closures = Array.from(s.matchAll(/(.)(.)/g)).map(m => [m[1], m[2]]);
        }

        // character sets incl. ranges, only hyphen is escaped as \-
        else if (/^\[.+\]$/.test(s)) {
          let fragments = [];
          s = s.replace(/^\[/, "").replace(/]$/, ""); // trim range delimiters [ ]

          const ranges = s.matchAll(/([^\\])-(.)/g); // e.g. a-z
          Array.from(ranges).forEach(r => {
            let [, start, end] = r;
            [].push.apply(fragments, characterRange(start, end));
          });

          s = s.replace(/([^\\])-(.)/g, "");

          const singleCharacters = s.replace(/\\-/g, "-").split("");
          [].push.apply(fragments, singleCharacters);
          sets.push(fragments);
        }

        // words etc.
        else if (/^\(.+\)$/.test(s)) {
          let fragments = [];
          s = s.replace(/^\(/, "").replace(/\)$/, ""); // trim group delimiters ( )

          let options = [];
          let current = "";
          s.split("").forEach(char => {
            if (char === "|" && !/\\$/.test(current)) {
              options.push(current);
              current = "";
            }
            else { // pipe was escaped as \|
              current += char;
            }
          });
          options.push(current);

          options = options.map(o => o.replace(/\\\|/, "|"));
          [].push.apply(fragments, options);
          sets.push(fragments);
        }

        else {
          sets.push([s]);
        }
      });

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
          language: l.language,
          id: `${l.language}-${l.id}`,
          texts: l[fieldKey],
        }));
      const html = data
        .map(({ language, id, texts }) => {
          let header, fragments;
          switch (getters.selectedSampleKey) {
            case "gotchas":
              header = `<h3 class="gotcha-heading" id="${id}">${language}</h3>`;
              // eslint-disable-next-line no-unused-vars
              fragments = texts.map(({ topic, tags, tests }) =>
                `<h4>${topic}</h4>${tests.map(t => `<p>${t}</p>`).join("")}`);
              break;
            case "kerning":
              break;
            default:
              header = `<h3 id="${id}">${language}</h3>`;
              fragments = texts.map(t => `<p>${t}</p>`);
          }
          return header + fragments.join("");
        })
        .join("");
      commit("setText", { sampleKey: state.selectedSampleKey, html });
    },

    updateKerning({ state, commit }) {
      let html = state.kerningPatterns
        .filter(pattern => pattern.isVisible)
        .map(pattern => {
          function clone(array) { return JSON.parse(JSON.stringify(array)); }
          const sets = clone(pattern.sets);
          let product = cartesianProduct(...sets);
          let section = [];
          let current = product[0][0];
          let line = "";
          product.forEach(sub => {
            if (sub[0] !== current) {
              if (!pattern.closures.length) {
                line += current;
              }
              section.push(line);
              line = "";
              current = sub[0];
            }
            let fragment = sub.join("");
            if (pattern.closures.length) {
              fragment = pattern.closures
                .map(closure => `${closure[0]}${fragment}${closure[1]}`)
                .join(" ") + " ";
            }
            line += fragment;
          });

          return `<h6 id="${escapeHtmlId(pattern.id)}"></h6>`
            + `<p>${escapeHtml(section.join("\n"))}</p>`;
        })
        .join("");
      commit("setText", { sampleKey: "kerning", html });
    },

    addKerningPattern({ dispatch, commit }, { segments }) {
      commit("addKerningPattern", { segments });
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
