<template>
  <div class="help-topic">
    <div class="help">
      <div class="reading">
        <h2 class="help-heading">
          <router-link :to="`/help`">Help / </router-link>Animation editor
        </h2>
        <Animation />
      </div>
    </div>
    <div class="example"/>
  </div>
</template>

<script>
import Animation from "./Animation.md";

export default {
  components: {
    Animation,
  },
}
</script>

<style lang="scss" scoped>
</style>
