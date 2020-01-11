<template>
<div class="character-panel">
  <CharacterInfo :character="characterInfo.character" />

  <div><strong>{{printNumber(characterInfo.speakers)}}</strong> speakers total</div>

  <div v-if="characterInfo.obligatoryLanguages">
    <h4>obligatory in {{characterInfo.obligatoryLanguages.length}} languages</h4>
    <div>
      <div v-for="(l, i) in characterInfo.obligatoryLanguages" :key="i">
      <a :href="`https://en.wikipedia.org/wiki/${l.language.replace(/(languages)?$/,'_language')}`"
        target="_blank" rel="noopener noreferrer"
      >{{ l.language }}</a>
      </div>
    </div>

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

export default {
  components: {
    CharacterInfo,
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
  h4 {
    margin: 0.7em 0 0.3em;
    &:after {
      content: ':';
    }
  }
}
</style>
