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
            Font supports <strong>{{ languageSupport.supportedLanguages.length }}</strong> out of <strong>{{ languageSupport.languages.length }}</strong> listed languages.
        </p>

        <h2>
          Supported languages
          <UiSelect class="inline" :options="supportedLanguagesSortingOptions" v-model="supportedLanguagesSorting" />
        </h2>

        <LanguageList :languages="supportedLanguages" @select-language="l => selectLanguage(l)" />

        <h2>
          Unsupported languages
          <UiSelect class="inline" :options="unsupportedLanguagesSortingOptions" v-model="unsupportedLanguagesSorting" />
        </h2>

        <div>
          <span
            v-for="(l, i) in unsupportedLanguages"
            :key="i"
          >
            <UiButton :class="`support-${Math.min(4, Math.ceil(l.missingCharacters.length / 5))}`"
              @click="selectLanguage(l)"
            >
              {{ l.language }}
            </UiButton>
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
          <div v-for="(script, i) in languageSupport.missingCharacterCombinationsByScript" :key="i">
            <h3>{{ script.script }}</h3>
            <button :class="`glyph support-${
                5 - [ 0, 20000, 600000, 2000000, 8000000 ].filter(limit => c.speakers > limit).length
              }`"
              v-for="(c, j) in script.characters" :key="j"
              @click="selectCharacter(c)"
            >{{ c.character }}
            </button>
          </div>
        </div>

        <h2>
          Included characters by script
        </h2>

        <FontSample>
          <div v-for="(script, i) in languageSupport.includedCharactersByScript" :key="i">
            <h3>{{ script.script }}</h3>
            <div :class="`glyph support-${
                5 - [ 0, 20000, 600000, 2000000, 8000000 ].filter(limit => c.speakers > limit).length
                }`"
              v-for="(c, j) in script.characters.filter(c => c.character.length === 1)" :key="j"
              @click="selectCharacter(c)"
            >{{ c.character }}</div>
          </div>
        </FontSample>

        <h2>
          Included character combinations by script
        </h2>

        <FontSample>
          <div v-for="(script, i) in languageSupport.includedCharacterCombinationsByScript" :key="i">
            <h3>{{ script.script }}</h3>
            <div :class="`glyph support-${
                5 - [ 0, 20000, 600000, 2000000, 8000000 ].filter(limit => c.speakers > limit).length
                }`"
              v-for="(c, j) in script.characters" :key="j"
              @click="selectCharacter(c)"
            >{{ c.character }}</div>
          </div>
        </FontSample>

        <h2>
          All included characters
        </h2>

        <FontSample>
          <div
            v-for="(c, j) in languageSupport.fontCharacters" :key="j"
            :class="`glyph support-${
                5 - [ 0, 20000, 600000, 2000000, 8000000 ].filter(limit => c.speakers > limit).length
              }`"
            @click="selectCharacter(c)"
          >{{ c.character }}</div>
        </FontSample>

      </div>
    </div>

    <Pinnable
      class="sidebar"
      :isPinned="true"
      :isVisible="true"
      :scrolled="false"
    >
      <div class="language-character-sidebar">
        <ScrollPanel v-if="selectedCharacter">
          <CharacterPanel :characterInfo="selectedCharacter"
            @select-language="l => selectLanguage(l)"
          />
        </ScrollPanel>
        <div class="placeholder-info" v-else>
          {{ languageSupport.characters.filter(c => !c.isMissing).length }} /
          {{ languageSupport.characters.length }} characters
        </div>

        <ScrollPanel v-if="selectedLanguage">
          <LanguagePanel :lang="selectedLanguage.htmlTag" :languageInfo="selectedLanguage"
            @character-clicked="c => selectCharacter(languageSupport.characters.find(cc => cc.character === c))"
          />
        </ScrollPanel>
        <div class="placeholder-info" v-else>
          {{ languageSupport.supportedLanguages.length }} /
          {{ languageSupport.languages.length }} languages
        </div>
      </div>
    </Pinnable>

  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import Pinnable from "@/components/layout/Pinnable";
import ScrollPanel from "@/components/layout/ScrollPanel";
import UiTooltip from "@/components/UiTooltip";
import LanguagePanel from "@/components/LanguagePanel";
import LanguageList from "@/components/LanguageList";
import CharacterPanel from "@/components/CharacterPanel";
import FontSample from "@/components/FontSample";
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
    LanguagePanel,
    LanguageList,
    CharacterPanel,
    UiTooltip,
    UiButton,
    UiSelect,
    Pinnable,
    ScrollPanel,
    FontSample,
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
      selectedLanguage: null,
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
    selectCharacter(c) {
      this.selectedCharacter = c;
    },
    selectLanguage(c) {
      this.selectedLanguage = c;
    },
  },
}
</script>

<style lang="scss">
.language-support-summary {
  margin-bottom: 1.5rem;

  display: flex;

  .font-sample {
    background: transparent !important;
    color: black !important;
  }

  .main-column {
    padding: 1rem;
  }
  .sidebar {
    background: transparent !important;
    --backgroundColor: transparent;
    padding: 1rem;
    flex-shrink: 0;
    width: 40%;
    height: 100%;
    // align-self: flex-start;
    // position: sticky;
    // top: 0;

    .language-character-sidebar {
      display: flex;
      height: 100%;
      flex-direction: column;
      justify-content: space-between;
      > :first-child {
        margin-bottom: 1.5em;
      }
      > * {
        border-radius: 0.8em;
        flex: 0 0 50%;
        overflow-y: hidden;
        display: flex;
        flex-direction: column;
        justify-content: center;
        background: white !important;
        padding: 1em;
        padding-right: 0.1em;

        .character-panel, .language-panel {
          margin-right: 1em;
        }

        >:not(.placeholder-info) {
          height: 100%;
        }
      }
    }
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



/****************/
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
/****************/


/****************/
  $aText: #501111;

  @for $i from 0 through 5 {
    .support-#{$i} {
      $shade: hsl((5 - $i) * 20 + if($i==0, 25, 0), 55, 72);
      background: mix(white, $shade, 0);
      color: mix($aText, black, $i * 20);
      // color: white;
      font-weight: 500;
      text-transform: none;
    }
  }
/****************/



}

.placeholder-info {
  text-align: center;
  font-variant-caps: small-caps;
  color: #aaa;
}
</style>
