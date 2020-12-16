<template>
<div class='language-panel'>
  <div class="info-bar">
    <strong>{{ languageInfo.language }} </strong>
    <div><label>OpenType: </label> <code>{{ languageInfo.opentypeTag }}</code> </div>
    <div><label>HTML: </label> <code>{{ languageInfo.htmlTag }}</code> </div>
    <a :href="`https://en.wikipedia.org/wiki/${languageInfo.language.replace(/languages?$/,'_language')}`"
      target="_blank" rel="noopener noreferrer"
    >Wikipedia</a>
  </div>

  <p><strong>{{ printNumber(languageInfo.speakers) }} speakers</strong></p>

  <header v-if="languageInfo.missingCharacters.length">missing characters</header>
  <div class='glyphs'>
    <button class="glyph support-4" v-for="(c, j) in languageInfo.missingCharacters" :key="j"
      @click="$emit('character-clicked', c)"
    >{{ c }}
    </button>
  </div>

  <header v-if="languageInfo.includedCharacters.length">supported characters</header>
  <FontSample>
    <div
      :class="`glyph needed-${
      5 - [ 0, 20000, 600000, 2000000, 8000000 ].filter(limit => characters.find(ch => ch.character === c).speakers > limit).length
      }`"
      v-for="(c, j) in languageInfo.includedCharacters" :key="j"
      @click="$emit('character-clicked', c)"
    >{{ c }}</div>
  </FontSample>

  <div v-if="languageInfo.specialLetters.length != languageInfo.requiredCharacters.length">
    <header>letter units</header>
    <FontSample>
      <div class="glyph" v-for="(c, j) in languageInfo.specialLetters" :key="j"
        @click="$emit('character-clicked', c)"
      >{{ c }}</div>
    </FontSample>
  </div>

  <div v-if="languageInfo.gotchas.length">
    <header>gotchas</header>
    <div class="gotchas">
      <p v-for="(g, i) in languageInfo.gotchas" :key="i"
        v-html="`<strong>${g.topic}:</strong> ` + (g.description || g.tags.join(', '))"
      />
      <p>
        <router-link :to="`/gotchas#${languageInfo.language}-${languageInfo.id}`">
          go to tests
        </router-link>
      </p>
    </div>
  </div>

</div>
</template>

<script>
import printNumber from "@/utils/printNumber.js";
import FontSample from "@/components/FontSample";

export default {
  components: {
    FontSample,
  },
  props: {
    languageInfo: {
      type: Object,
      required: true,
    },
    characters: {
      type: Array,
      required: true,
    },
  },
  methods: {
    printNumber,
  },
}
</script>

<style lang="scss" scoped>

.info-bar {
  display: flex;
  align-items: center;
  > :not(:first-child) {
    margin-left: 1rem;
  }
  > :last-child {
    margin-left: auto;
  }
  label {
    color: gray;
    font-size: 0.85em;
  }
}

header {
  text-transform: uppercase;
  font-weight: bold;
  font-size: 0.8em;
  color: #888;
  margin-top: 1em;
}
p {
  margin: 0.3em 0;
}
</style>

