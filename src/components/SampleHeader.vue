<template>
  <div class='header-flex'>
    <h3 :id="header.langId">{{ header.language }}</h3>
    <div v-if="header.opentypeTag">
      <span class="light">OT code: </span><code>{{ header.opentypeTag.padEnd(4, ' ') }} </code>
      <span class="light">HTML code: </span><code>{{ header.htmlTag }}</code>
    </div>
    <div>{{ printNumber(header.speakers) }} speakers</div>
  </div>
</template>

<script>
import printNumber from "@/utils/printNumber.js";

export default {
  props: {
    header: {
      type: Object,
      default: () => {},
    },
  },
  methods: {
    printNumber,
  },
}
</script>

<style lang="scss" scoped>
</style>
