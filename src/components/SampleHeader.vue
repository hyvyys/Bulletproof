<template>
  <div class='header-flex'>
    <h3 :id="header.langId">{{ header.language }}</h3>
    <div v-if="header.opentypeTag">
      <span class="light">OT code: </span><code>{{ header.opentypeTag.padEnd(4, ' ') }}</code>
      <span class="light">HTML code: </span><code>{{ header.htmlTag.padEnd(4, ' ') }}</code>
    </div>
    <div>{{ fNum(header.speakers) }} speakers</div>
  </div>
</template>

<script>
export default {
  props: {
    header: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    fNum(n) { return n > 1000000 ? n/1000000 + 'M' : n/1000 + 'K'; },
  },
}
</script>

<style lang="scss" scoped>
</style>
