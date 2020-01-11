<template>
<div class='language-info'>
  <div class="info-bar">
    <strong>{{ languageInfo.language }} </strong>
    <a :href="`https://en.wikipedia.org/wiki/${languageInfo.language.replace(/languages?$/,'_language')}`"
      target="_blank" rel="noopener noreferrer"
    >Wikipedia</a>
  </div>
  <div>OpenType: <code>{{ languageInfo.opentypeTag }}</code> </div>
  <div>HTML: <code>{{ languageInfo.htmlTag }}</code> </div>

  <p><strong>{{ printNumber(languageInfo.speakers) }} speakers</strong></p>

  <div class='glyphs'>
    <code class="glyph support-0" v-for="(c, j) in languageInfo.includedCharacters" :key="j"
      @click="$emit('characterClicked', c)"
    >{{ c }}
    </code>
  </div>

  <div v-if="languageInfo.gotchas.length">
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
</template>

<script>
import printNumber from "@/utils/printNumber.js";

export default {
  props: {
    languageInfo: {
      type: Object,
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
  justify-content:
  space-between;
  align-items: center;
  :not(:first-child) {
    margin-left: 1rem;
  }
}
.language-info {
  p {
    margin: 0.45em 0;
  }

  .glyphs {
    max-height: 50vh;
    overflow: auto;
  }
}
</style>

