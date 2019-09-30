<template>
  <div class="welcome reading">
    <div class="fold">
      <figure class="banner">
        <img class="logo" svg-inline src="../assets/images/logo.svg" />
        <h1>Bulletproof</h1>
        <div class="subtitle">I Wish I Was...</div>
      </figure>
      <div class="invitation">
        Drop font files anywhere to start
      </div>
    </div>
    <WelcomeText class="readme" />
  </div>
</template>

<script>
import WelcomeText from "@/views/Welcome.md";

export default {
  name: "Welcome",
  components: { WelcomeText },
  props: {},
  mounted() {
    this.$store.commit("scrollToTop");
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "@/scss/welcome.scss";
</style>
