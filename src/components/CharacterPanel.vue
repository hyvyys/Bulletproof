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

      <div v-if="characterInfo.obligatoryLanguages.length === 1">
        <a :href="`https://wordfinder.italicharacterInfo.space/search?i=${characterInfo.character}&l=${characterInfo.obligatoryLanguages[0].htmlTag}`"
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
  methods: {
    printNumber,
  }
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
