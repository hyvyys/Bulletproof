<template>
<div class="character-info">
  <div class="character-font-preview">{{ character  }} </div>
  <div class="info-bar">
    <div style="font-size: 2.5rem">{{ character  }} </div>
    <div>{{ codepoints }}</div>
    <a
      :href="`https://en.wikipedia.org/wiki/${ character }`"
      target="_blank" rel="noopener noreferrer"
    >Wikipedia</a>
  </div>
</div>
</template>

<script>
export default {
  props: {
    character: {
      type: String,
      required: true,
    },
  },
  computed: {
    codepoints() {
      return this.character.split('').map(c => 'uni' + c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")).join(' + ');
    },
  },
}
</script>

<style lang="scss" scoped>
.character-font-preview {
  font-size: 6rem;
  text-align: center;
  font-family: var(--selectedFontFamily);
}
.info-bar {
  display: flex;
  justify-content:
  space-between;
  align-items: center;
  :not(:first-child) {
    margin-left: 1rem;
  }
}
</style>
