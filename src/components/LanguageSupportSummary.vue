<template>
  <div class="language-support-summary">

    <v-style>
      .glyph {
        font-size: {{ settings.fontSize }}{{ settings.fontSizeUnit }};
      }
    </v-style>

    <div class="main-column">
      <div>
        <p>
            Font supports <strong>{{ languageSupport.supportedLanguages.length }}</strong> out of <strong>{{ languageSupport.allLanguages.length }}</strong> listed languages.
        </p>

        <h2>
          Supported languages
          <UiSelect class="inline" :options="supportedLanguagesSortingOptions" v-model="supportedLanguagesSorting" />
        </h2>

        <div>
          <div>
            <UiButton @click="copySupportedLanguages">copy list</UiButton>
            <textarea
              style="position: absolute;left:-9999px"
              ref="supportedLanguages"
              :value="languageSupport.supportedLanguages.map(l => l.language).join(', ')"
            />
          </div>

          <span
            v-for="(l, i) in supportedLanguages"
            :key="i"
            :lang="l.htmlCode"
          >
            <UiButton :class="`support-${Math.min(4, Math.ceil(l.missingCharacters.length / 5))}`">
              {{ l.language }}
              <div class="gotcha-warning-icon" v-if="l.gotchas.length">
                !
              </div>
            </UiButton>

            <UiTooltip :appendToBody="false" :interactive="true" openOn="click">
              <LanguageInfo :lang="l.htmlTag" :languageInfo="l" @characterClicked="c =>
                selectCharacter(languageSupport.includedCharactersByScript.find(s=>s.script===l.script).characters
                  .find(cc => cc.character === c))"
              />
            </UiTooltip>
          </span>
        </div>

        <h2>
          Unsupported languages
          <UiSelect class="inline" :options="unsupportedLanguagesSortingOptions" v-model="unsupportedLanguagesSorting" />
        </h2>

        <div>
          <span
            v-for="(l, i) in unsupportedLanguages"
            :key="i"
          >
            <UiButton :class="`support-${Math.min(4, Math.ceil(l.missingCharacters.length / 5))}`">
              {{ l.language }}
            </UiButton>

            <UiTooltip :appendToBody="false" :interactive="true" openOn="click">
              <div style="display: flex">
                <strong>{{ l.language }} </strong>
                <a style="margin-left: auto"
                  :href="`https://en.wikipedia.org/wiki/${l.language.replace(/languages?$/,'_language')}`"
                  target="_blank" rel="noopener noreferrer"
                >Wikipedia</a>
              </div>

              <p><strong>{{ printNumber(l.speakers) }} speakers</strong></p>
              <div>
                <div>missing:</div>
                <button class="glyph support-4" v-for="(c, j) in l.missingCharacters" :key="j"
                  @click="selectCharacter(languageSupport.missingCharactersByScript.find(s=>s.script===l.script).characters.find(cc => cc.character === c))"
                >{{ c }}
                </button>
              </div>
              <div>
                <div>supported:</div>
                <button class="glyph support-0" v-for="(c, j) in l.includedCharacters" :key="j"
                  @click="selectCharacter(languageSupport.includedCharacters.find(cc => cc.character === c))"
                >{{ c }}
                </button>
              </div>
            </UiTooltip>
          </span>
        </div>

        <h2>
          Missing characters
          <UiSelect class="inline" :options="missingCharacterSortingOptions" v-model="missingCharacterSorting" />
        </h2>

        <div>
          <div v-for="(script, i) in missingCharacters" :key="i">
            <h3>{{ script.script }}</h3>
            <button :class="`glyph support-${
                5 - [ 0, 20000, 600000, 2000000, 8000000 ].filter(limit => c.speakers > limit).length
              }`"
              v-for="(c, j) in script.characters.filter(c => c.character.length === 1)" :key="j"
              @click="selectCharacter(c)"
            >{{ c.character }}
            </button>
          </div>
        </div>

        <h2>
          Missing character combinations by script
        </h2>

        <div>
          <div v-for="(script, i) in languageSupport.missingCharactersByScript" :key="i">
            <h3>{{ script.script }}</h3>
            <button :class="`glyph support-${
                5 - [ 0, 20000, 600000, 2000000, 8000000 ].filter(limit => c.speakers > limit).length
              }`"
              v-for="(c, j) in script.characters.filter(c => c.character.length > 1 && isAccent(c, 1))" :key="j"
              @click="selectCharacter(c)"
            >{{ c.character }}
            </button>
          </div>
        </div>

        <h2>
          Included characters by script
        </h2>

        <div>
          <div v-for="(script, i) in languageSupport.includedCharactersByScript" :key="i">
            <h3>{{ script.script }}</h3>
            <button :class="`glyph support-${
                5 - [ 0, 20000, 600000, 2000000, 8000000 ].filter(limit => c.speakers > limit).length
                }`"
              v-for="(c, j) in script.characters.filter(c => c.character.length === 1)" :key="j"
              @click="selectCharacter(c)"
            >{{ c.character }}
            </button>
          </div>
        </div>

        <h2>
          Included character combinations by script
        </h2>

        <div>
          <div v-for="(script, i) in languageSupport.includedCharactersByScript" :key="i">
            <h3>{{ script.script }}</h3>
            <button :class="`glyph support-${
                5 - [ 0, 20000, 600000, 2000000, 8000000 ].filter(limit => c.speakers > limit).length
                }`"
              v-for="(c, j) in script.characters.filter(c => c.character.length > 1 && isAccent(c, 1))" :key="j"
              @click="selectCharacter(c)"
            >{{ c.character }}
            </button>
          </div>
        </div>

        <h2>
          All included characters
        </h2>

        <div>
          <button
            v-for="(c, j) in languageSupport.includedCharacters" :key="j"
            :class="`glyph support-${
                5 - [ 0, 20000, 600000, 2000000, 8000000 ].filter(limit => c.speakers > limit).length
              }`"
            @click="selectCharacter(c)"
          >{{ c.character }}
          </button>
        </div>

      </div>
    </div>

    <Pinnable
      class="sidebar"
      :isPinned="true"
      :isVisible="true"
      :scrolled="true"
    >
      <CharacterPanel v-if="selectedCharacter" :characterInfo="selectedCharacter" />
    </Pinnable>

  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import Pinnable from "@/components/layout/Pinnable.vue";
import UiTooltip from "@/components/UiTooltip";
import LanguageInfo from "@/components/LanguageInfo";
import CharacterPanel from "@/components/CharacterPanel";
import UiButton from "keen-ui/src/UiButton";
import UiSelect from "keen-ui/src/UiSelect";
import printNumber from "@/utils/printNumber.js";

import Vue from 'vue';

Vue.component('v-style', {
  render: function (createElement) {
    return createElement('style', this.$slots.default)
  }
});

const unsupportedLanguagesSortingOptions = [
  'alphabetically',
  'by speakers',
  'by included chars',
  'by missing chars',
  'by missing chars/speakers',
];
const supportedLanguagesSortingOptions = unsupportedLanguagesSortingOptions;
const missingCharacterSortingOptions = [
  'alphabetically',
  'by speakers',
  'by language count'
];

export default {
  components: {
    LanguageInfo,
    CharacterPanel,
    UiTooltip,
    UiButton,
    UiSelect,
    Pinnable,
  },
  data() {
    return {
      unsupportedLanguagesSortingOptions,
      supportedLanguagesSortingOptions,
      missingCharacterSortingOptions,
      unsupportedLanguagesSorting: unsupportedLanguagesSortingOptions[0],
      supportedLanguagesSorting: supportedLanguagesSortingOptions[1],
      missingCharacterSorting: missingCharacterSortingOptions[2],
      selectedCharacter: null,
    }
  },
  computed: {
    ...mapGetters([
      "selectedSampleKey",
      "languageSupport",
      "settings",
    ]),
    supportedLanguages() {
      let langs = this.languageSupport.supportedLanguages.slice();
      this.sortLanguages(langs, this.supportedLanguagesSorting);
      return langs;
    },
    unsupportedLanguages() {
      let langs = this.languageSupport.unsupportedLanguages.slice();
      this.sortLanguages(langs, this.unsupportedLanguagesSorting);
      return langs;
    },
    missingCharacters() {
      let chars = this.languageSupport.missingCharactersByScript.map(script => ({ ...script, characters: script.characters.slice() }));
      switch (this.missingCharacterSortingOptions.indexOf(this.missingCharacterSorting)) {
        case 1: chars.forEach(s => s.characters.sort((a, b) => b.speakers - a.speakers)); break;
        case 2: chars.forEach(s => s.characters.sort((a, b) => b.obligatoryLanguages.length - a.obligatoryLanguages.length)); break;
      }
      return chars;
    },
  },
  methods: {
    sortLanguages (langs, sorting) {
      switch (this.supportedLanguagesSortingOptions.indexOf(sorting)) {
        case 1: langs.sort((a, b) => b.speakers - a.speakers); break;
        case 2: langs.sort((a, b) => b.includedCharacters.length - a.includedCharacters.length); break;
        case 3: langs.sort((a, b) => b.missingCharacters.length - a.missingCharacters.length); break;
        case 4: langs.sort((a, b) => -b.missingCharacters.length / b.speakers + a.missingCharacters.length / a.speakers); break;
      }
      return langs;
    },

    printNumber,
    copySupportedLanguages() {
      this.$refs.supportedLanguages.select();
      document.execCommand('copy');
      window.getSelection().removeAllRanges();
    },
    selectCharacter(c) {
      this.selectedCharacter = c;
    },
    isAccent(c, i) {
      return c.character.charCodeAt(i) > 0x0300 && c.character.charCodeAt(i) < 0x037E;
    },
  },
}
</script>

<style lang="scss">
.language-support-summary {
  margin-bottom: 1.5rem;

  display: flex;

  .main-column {
    padding: 1rem;
  }
  .sidebar {
    background: white !important;
    --backgroundColor: white;
    padding: 1rem;
    flex-shrink: 0;
    width: 250px;
    height: 100%;
    // align-self: flex-start;
    // position: sticky;
    // top: 0;
  }

  .ui-button {
    border-radius: 0;
    margin: 1px;
  }

  .ui-tooltip-theme,
  .ui-tooltip {
    font-size: 1.1rem;
    text-align: left;
    background: white;
    color: black;
  }
  .ui-tooltip-theme {
    box-shadow: 0 0 6px #aaa;
  }

  .glyph {
    border: 0;
    display: inline-block;
    background: #ddd;
    text-align: center;
    margin: 1px;

    font-size: 1.5em;
    min-width: 1.5em;
    line-height: 1.5em;
    font-family: var(--selectedFontFamily), var(--fallbackFontFamily);
    // &:hover {
      //   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    // }

    user-select: text;

    &:hover, &:focus {
      cursor: default;
      background-image: linear-gradient(#{rgba(white, 0.5), rgba(white, 0.5)});
    }

    &, &:active {
      // padding: 0;
    }
  }

  h2, h3 {
    margin: 1.5em 0 0.5em !important;
  }
  h3 {
    margin: 0.5em 0 !important;
  }

  .ui-select.inline {
    display: inline-flex;
    margin: 0 0.25em;
    .ui-select__display, ui-select__display-value {
      font-size: 1em;
      min-width: 10em;
    }
  }

  .support-0 {
    background: #bbffc7;
  }
  .support-1 {
    background: #def087;
  }
  .support-2 {
    background: #fff563;
  }
  .support-3 {
    background: #ffd1a6;
  }
  .support-4 {
    background: #ffb1b1;
  }

  $a: lighten($brand-primary-color, 10);
  $b: lighten($brand-secondary-color, 5);
  $a: #ffbcd2;
  $b: #b0bcff;

  $a: #f1bfb6;
  $b: #ffa806;
  $aText: #d87b12;

  $a: #f0e3e3;
  $b: #44e4d6;
  $aText: #6db9b6;

  $a: #f0e3e3;
  $b: #92beff;
  $aText: #2e78b4;

  @for $i from 0 through 5 {
    .support-#{$i} {
      $shade: mix($a, $b, $i * 20);
      background: mix(white, $shade, 0);
      color: mix($aText, black, $i * 20);
      // color: white;
      font-weight: 500;
      text-transform: none;
    }
  }

  .gotcha-warning-icon {
    margin-left: 0.4em;
    margin-right: -0.4em;
    border-radius: 50%;
    color: $b;
    background: $a;
    opacity: 0.5;
    font-weight: bold;
    width: 1.2em;
    height: 1.2em;
    line-height: 1.2;
  }
}
</style>
