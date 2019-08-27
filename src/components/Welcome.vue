<template>
  <div class="welcome">
    <figure class="banner">
      <img class="logo" svg-inline src="../assets/images/logo.svg" />
      <h1>Bulletproof</h1>
      <div class="subtitle">I Wish I Was...</div>
    </figure>

    <Readme />
  </div>
</template>

<script>
import Readme from "../../README.md";

export default {
  name: "Welcome",
  components: { Readme },
  props: {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "@/scss/variables";
@import "@/scss/mixins";

.welcome {
  max-width: 800px;
  margin: 40px auto;
  font-size: 1.35em;
  line-height: 1.45;
  font-weight: 500;
}
.banner {
  font-size: 6rem;
  text-align: center;
  .logo {
    height: 4em;
    margin: -1em 0 -0.6em;
  }
  h1 {
    font-size: 1em;
    margin: 0;
    line-height: 1;
  }
  .subtitle {
    font-style: italic;
    font-size: 0.33em;
    position: relative;
    left: 4.75em;
  }
}
</style>
