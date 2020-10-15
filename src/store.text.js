import Vue from "vue";
import router from "@/router";

import getId from "@/utils/id";
import kerningPatterns from "@/models/kerningPatterns";
import kerningPatternName from "@/models/kerningPatternName";
import languageDataFields from "@/models/textKindLanguageDataField";
import LanguageData from "language-data";
import escapeHtmlId from "./utils/escapeHtmlId";
import escapeHtml from "./utils/escapeHtml";
import CharacterFilter from "./models/CharacterFilter";
import KerningGenerator from "./models/KerningGenerator";

let id = 0;
let customTextId = 1;

const SCRIPTS = {
  Latn: { name: 'Latin' },
  Cyrl: { name: 'Cyrillic' },
  Armn: { name: 'Armenian' },
  Grek: { name: 'Greek' },
  IPA:  { name: 'IPA', isSelected: false },
};

const SCRIPT_TAGS = LanguageData.map(l => l.script).filter((v, i, a) => a.indexOf(v) === i);
const LANGUAGES = LanguageData.sort((a,b) => a.language.localeCompare(b.language));

export default {
  state: {
    selectedSampleKey: "",
    texts: [],
    customTextIds: [],
    languages: LANGUAGES.map(l => ({ ...l, id: id++, isSelected: true })),
    scripts: SCRIPT_TAGS.map(s => ({ script: s, id: id++, isSelected: true, ...SCRIPTS[s] })),
    textHeadings: [],
    formatRequested: false,
    kerningPatterns: [],
    defaultKerningPatterns: kerningPatterns,
    fontCharacters: 'xyz'.split(),
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
        Vue.set(state.texts, state.selectedSampleKey, [{ html }]);
        // state.texts[state.selectedSampleKey] = html;
      }
      state.textHeadings = headings;
    },

    addCustomText(state, { html }) {
      state.customTextIds.push(customTextId);
      state.texts[customTextId] = [{ html }];
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

    selectDeselectAllLanguages(state, { checked }) {
      state.languages.forEach(l => l.isSelected = checked);
    },

    selectScripts(state, { values }) {
      state.scripts.forEach(s => {
        if (values.indexOf(s) > -1) {
          s.isSelected = true;
        }
        else {
          s.isSelected = false;
        }
      });
    },

    clearKerningPatterns(state) {
      state.kerningPatterns.splice(0);
      this.commit("setText", { sampleKey: "kerning", html: "" });
    },

    initKerningPatterns(state) {
      state.defaultKerningPatterns.forEach(({ segments, isVisible = true }) => {
        this.commit("addKerningPattern", { segments, isVisible, toEnd: true });
      });
    },

    addKerningPattern(state, { segments, isVisible, toEnd }) {
      const { sets, closures } = KerningGenerator.sets(segments);
      const copy = state.kerningPatterns.slice();
      const pattern = { segments, sets, closures, isVisible };
      pattern.lines = KerningGenerator.kerningString(pattern);
      pattern.name = kerningPatternName(pattern);
      pattern.id = getId('kerning-pattern-' + pattern.name);
      if (toEnd) {
        copy.push(pattern);
      } else {
        copy.unshift(pattern);
      }
      state.kerningPatterns = copy;
    },

    updateKerningPattern(state, { id, segments }) {
      const { sets, closures } = KerningGenerator.sets(segments);
      let copy = state.kerningPatterns.slice();
      let pattern = copy.find(kp => kp.id === id);
      if (!pattern) {
        this.commit("addKerningPattern", { segments, isVisible: true });
        copy = state.kerningPatterns.slice();
        pattern = copy[0];
        pattern.id = id;
      }
      pattern.segments = segments;
      pattern.sets = sets;
      pattern.closures = closures;
      pattern.lines = KerningGenerator.kerningString(pattern);
      pattern.name = kerningPatternName(pattern);
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

    updateKerning(state) {
      let patterns = state.kerningPatterns
        .filter(pattern => pattern.isVisible);
      let html = patterns
        .map(pattern => {
          const lines = pattern.lines;
          const text = lines[0].length > 50
            ? lines.join("\n")
            : lines.join(" ").replace(/ +/g, " ");
          return {
            header: `<h6 id="${escapeHtmlId(pattern.id)}"></h6>`,
            texts: [`<p>${escapeHtml(text)}</p>`],
          };
        });
      this.commit("setText", { sampleKey: "kerning", html });
      },

      updateFontCharacters(state, { characters }) {
        state.fontCharacters = characters;
      },
  },

  actions: {
    selectScripts({ state, commit, dispatch }, { values }) {
      commit("selectScripts", { values });
      dispatch("updateText");
    },

    selectLanguage({ state, commit, dispatch }, { id, checked }) {
      const matching = state.languages.find(l => l.id === id);
      if (matching.isSelected !== checked) {
        commit("selectLanguage", { id, checked });
        dispatch("updateText");
      }
    },

    selectSample({ state, commit, dispatch }, { kind, id }) {
      commit("selectSample", { kind, id });
      if (kind === "kerning") {
        if (state.kerningPatterns.length === 0) {
          this.commit("initKerningPatterns");
        }
      }
      dispatch("updateText");
    },

    updateFontCharacters({ dispatch }, { font }) {
      const characters = font.characters;
      this.commit("updateFontCharacters", { characters });
      dispatch("updateText");
    },

    updateText({ state, commit, getters }) {

      function squish(str) { return str.replace(/\s\s+/g, "") }
      function fNum(n) { return n > 1000000 ? n/1000000 + 'M' : n/1000 + 'K'; }

      const fieldKey = getters.selectedSampleTextKey;
      if (!fieldKey) {
        if (state.selectedSampleKey === "kerning") {
          commit("updateKerning");
        }
        else if (state.selectedSampleKey === "glyphs") {
          let texts = [
            `<p class="font-characters">${
              state.fontCharacters.map(c => `<span title='U+${
                String(c.charCodeAt(0)).padStart(4, '0')
              }'>${c}</span>`).join('')
            }<p>`,
          ];
          commit("setText", {
            sampleKey: state.selectedSampleKey,
            html: [{ header: '', texts }],
          });
        }
        return;
      }

      let data = getters.selectedLanguages
        .map(l => ({
          ...l,
          id: `${l.language}-${l.id}`,
          texts: l[fieldKey],
        }));

      let mappedData = []; // one to many

      if (getters.selectedSampleKey === 'gotchas') {
        data.forEach(({ id: langId, language, speakers, htmlTag, opentypeTag, texts }) => {
          let tests = texts.map(({ topic, tags, tests, description }) => {
            // let header = squish(
            //   `<div class='header-flex'>
            //     <h3 id="${l.id}">${l.language} — ${topic}</h3>
            //     <div class="tags">${tags.map(t => `<span>${t}</span>`).join("")}</div>
            //     ${l.opentypeTag ? `<div>OT code: <code>${l.opentypeTag.padEnd(4, ' ')}</code></div>` : ''}
            //     <div>${fNum(l.speakers)} speakers</div>
            //     <div class="desc">${description || ''}</div>
            //   </div>
            //   `
            // );
            let header = {
              id: langId + '-' + topic.replace(/[^a-z0-9]/ig, '_'),
              langId,
              language, speakers, htmlTag, opentypeTag,
              topic, tags, tests, description,
            }
            let fragments = [squish(
              `<div lang="${htmlTag}">
                ${tests.map(t => `<p>${t}</p>`).join("")}
              </div>`
            )];
            return {
              header,
              texts: fragments,
            };
          });
          mappedData = [ ...mappedData, ...tests ];
        });
      } else {
        mappedData = data
        .map(({ id: langId, language, script, speakers, htmlTag, opentypeTag, texts }) => {
          let header = { langId, language, script, speakers, htmlTag, opentypeTag };
          let fragments;

          switch (getters.selectedSampleKey) {
            case "ABCs": {
              const AaBbCc = texts;
              const ABC = CharacterFilter.filter(AaBbCc, g => g.toUpperCase() === g)
                .replace(/ +/g, " ").trim();
              const abc = CharacterFilter.filter(AaBbCc, g => g.toLowerCase() === g)
                .replace(/ +/g, " ").trim();
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
              if (texts instanceof Array)
                fragments = texts.map(t => `<p>${t}</p>`);
              else
                fragments = [texts].map(t => `<p>${t}</p>`);
          }
          return {
            header,
            texts: fragments,
          };
        });
      }

      commit("setText", { sampleKey: state.selectedSampleKey, html: mappedData });
    },

    addKerningPattern({ commit }, { segments, toEnd }) {
      commit("addKerningPattern", { segments, isVisible: true, toEnd });
      commit("updateKerning");
    },

    updateKerningPattern({ commit }, { id, segments }) {
      commit("updateKerningPattern", { id, segments });
      commit("updateKerning");
    },

    removeKerningPattern({ commit }, { id }) {
      commit("removeKerningPattern", { id });
      commit("updateKerning");
    },

    toggleKerningPattern({ commit }, { id, on }) {
      commit("toggleKerningPattern", { id, on });
      commit("updateKerning");
    },

    clearKerningPatterns({ dispatch, commit }) {
      commit("clearKerningPatterns");
      setTimeout(() => {
        dispatch("updateText");
      }, 50);
    },

    revertKerningPatterns({ dispatch, commit }) {
      commit("clearKerningPatterns");
      commit("initKerningPatterns");
      dispatch("updateText");
    },
  },


  getters: {
    texts: state => state.texts,
    textHeadings: state => state.textHeadings,
    formatRequested: state => state.formatRequested,
    customTextIds: state => state.customTextIds,
    selectedSampleKey: state => state.selectedSampleKey,
    selectedSampleTextKey: state => languageDataFields[state.selectedSampleKey],
    scripts: state => state.scripts,
    selectedScripts: state => state.scripts.filter(s => s.isSelected),
    filteredLanguages: (state, getters) => state.languages.filter(l => getters.selectedScripts.find(s => s.script === l.script)),
    visibleLanguages: (state, getters) => {
      if (getters.selectedSampleKey === 'languages') {
        return getters.filteredLanguages.filter(l => l.alphabet);
      }
      else if (getters.selectedSampleTextKey) {
        return getters.filteredLanguages
          .filter(l => l[getters.selectedSampleTextKey].length);
      }
      else {
        return [];
      }
    },
    otherLanguages: (state, getters) => {
      return getters.filteredLanguages.filter(l => getters.visibleLanguages.find(ll => ll.id === l.id) == null);
    },
    selectedLanguages: (state, getters) => getters.visibleLanguages.filter(l => l.isSelected),
    languages: (state, getters) => [
      ...getters.visibleLanguages.map(l => ({ ...l, hasText: true })),
      ...getters.otherLanguages.map(l => ({ ...l, hasText: false })),
    ],
    kerningPatterns: (state) => state.kerningPatterns,

    languageSupport: (state, getters) => {
      const testableLanguages = getters.selectedLanguages; //.filter(l => l.specialCharacters);

      const details = testableLanguages.map(l => {
        const requiredCharacters = (l.script === 'Latn' ? l.specialCharacters : l.alphabet).split(' ').filter((e, i, a) => a.indexOf(e) === i && e);
        const includedCharacters = requiredCharacters.filter(g => g.split('').every(c => state.fontCharacters.indexOf(c) > -1));
        const missingCharacters = requiredCharacters.filter(g => includedCharacters.indexOf(g) === -1);
        return {
          ...l,
          requiredCharacters,
          includedCharacters,
          missingCharacters,
        };
      });

      const supportedLanguages = details
        .filter(l => l.requiredCharacters.length === l.includedCharacters.length);
      const unsupportedLanguages = details.filter(l => supportedLanguages.indexOf(l) === -1);

      const missingCharactersByScript = groupCharactersByScriptAndSpeakers(unsupportedLanguages, "missingCharacters");
      const includedCharactersByScript = groupCharactersByScriptAndSpeakers(supportedLanguages, "includedCharacters");

      const includedCharacters = state.fontCharacters.map(c => ({
          character: c,
          unicode: c.charCodeAt(0),
          obligatoryLanguages: LANGUAGES.filter(l => l.alphabet.indexOf(c) > -1),
          optionalLanguages: LANGUAGES.filter(l => l.optionalCharacters.indexOf(c) > -1),
        }))
        .map(ch => ({
          ...ch,
          speakers: [... ch.obligatoryLanguages, ...ch.optionalLanguages ].reduce((acc, cur) => acc + cur.speakers, 0),
        }));

      return {
        supportedLanguages,
        unsupportedLanguages,
        allLanguages: details,
        missingCharactersByScript,
        includedCharactersByScript,
        includedCharacters,
      };
    },
  },
}


function groupCharactersByScriptAndSpeakers(languages, fieldKey, targetKey = "characters") {
  const charactersByScript = [];
  languages.forEach(language => {
    let script = charactersByScript.find(s => s.script === language.script);
    if (!script) {
      script = { script: language.script, [targetKey]: [] }
      charactersByScript.push(script);
    }

    language[fieldKey].forEach(lc => {
      let character = script[targetKey].find(c => c.character === lc);
      if (!character) {
        character = { character: lc, languages: [], speakers: 0 };
        script[targetKey].push(character);
      }
      character.languages.push(language.language);
      character.speakers += language.speakers;
    });
  });

  charactersByScript.forEach(script => {
    script[targetKey]
    .sort((a, b) => a.character.localeCompare(b.character, 'en', { caseFirst: 'upper' }));
    script[targetKey]
      .forEach(c => {
        c.obligatoryLanguages = LANGUAGES.filter(l => l.alphabet.indexOf(c.character) > -1);
        c.optionalLanguages = LANGUAGES.filter(l => l.optionalCharacters.indexOf(c.character) > -1);
      });
  });

  return charactersByScript;
}
