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
    <Readme class="readme" />
  </div>
</template>

<script>
import Readme from "../../README.md";

export default {
  name: "Welcome",
  components: { Readme },
  props: {},
  mounted() {
    this.$store.commit("scrollToTop");
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
@import "@/scss/variables";
@import "@/scss/mixins";

.banner {
  font-size: 6rem;
  text-align: center;
  margin-bottom: 2rem;
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

.invitation {
  text-align: center;
  color: #aaa;
}

.fold {
  padding-bottom: 3em;
}

.readme {
  margin-bottom: 360px;
}
</style>
