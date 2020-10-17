<template>
<div class="character-info">
  <div class="character-font-preview">{{ character }} </div>
  <div class="info-bar">
    <div style="font-size: 2.5rem">{{ characterRepresentation  }} </div>
    <div>{{ unicodes }}</div>
    <div>{{ glyphnames }}</div>
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
    characterRepresentation() {
      let c = this.character.charCodeAt(0);
      return (c > 0x2FF && c < 0x327 ? '\u25CC' : '') + this.character;
    },
    codepoints() {
      return this.character.split('').map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0"));
    },
    glyphnames() {
      return this.codepoints.map(c => 'uni' + c).join(' + ');
    },
    unicodes() {
      return this.codepoints.map(c => 'U+' + c).join(' ');
    },
  },
}
</script>

<style lang="scss" scoped>
.character-info {
  .character-font-preview {
    font-size: 6rem;
    text-align: center;
    font-family: var(--selectedFontFamily);
  }
  .info-bar {
    display: flex;
    align-items: center;
    > * {
      margin-right: 1rem;
    }
    :last-child {
      margin-left: auto;
    }
  }
}
</style>
