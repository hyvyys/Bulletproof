<template>
<div class="character-panel">

    <CharacterInfo :character="characterInfo.character" />

    <div><strong>{{printNumber(characterInfo.speakers)}}</strong> speakers total</div>

    <div v-if="characterInfo.obligatoryLanguages">
      <h4>obligatory in {{characterInfo.obligatoryLanguages.length}} languages</h4>
      <div>
        <LanguageList :languages="characterInfo.obligatoryLanguages"
          :fields="['coverage']"
          @select-language="l => $emit('select-language', l)"
        />
      </div>
      <br>

      <div>
        <a :href="wordFinderUrl"
          target="_blank" rel="noopener noreferrer"
        >find words</a>
      </div>
    </div>

    <div v-if="characterInfo.optionalLanguages">
      <div v-if="characterInfo.optionalLanguages.length"><strong>optional in {{characterInfo.optionalLanguages.length}} languages</strong></div>
      <div>
        {{ characterInfo.optionalLanguages.map(l => l.language + ` (${l.optionalCharactersNote})`).join(', ')}}
      </div>
    </div>

</div>
</template>

<script>
import printNumber from "@/utils/printNumber.js";
import CharacterInfo from "@/components/CharacterInfo";
import LanguageList from "@/components/LanguageList";

export default {
  components: {
    CharacterInfo,
    LanguageList,
  },
  props: {
    characterInfo: {
      type: Object,
      required: true,
    },
  },
  computed: {
    wordFinderUrl() {
      return `https://wordfinder.italic.space/search` +
        `?i=${ this.characterInfo.character }` +
        `&l=${ this.characterInfo.obligatoryLanguages.map(l => l.htmlTag).join(',') }`
    },
  },
  methods: {
    printNumber,
  },
}
</script>

<style lang="scss" scoped>
.character-panel {
  padding-top: 1rem; /* avoid covering accent by scroll-veil */
  h4 {
    margin: 0.7em 0 0.3em;
    &:after {
      content: ':';
    }
  }
}
</style>
