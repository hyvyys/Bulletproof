<template>
  <div class="help-topic">
    <div class="help">
      <div class="reading">
        <h2 class="help-heading">
          <router-link :to="`/help`">Help / </router-link>Preloading custom fonts
        </h2>
        <QueryString />
      </div>
    </div>
    <div class="example"/>
  </div>
</template>

<script>
import QueryString from "./QueryString.md";

export default {
  components: {
    QueryString,
  },
}
</script>