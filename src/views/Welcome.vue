<template>
  <div class="welcome reading">
    <div class="fold">
      <figure class="banner">
        <img class="logo" svg-inline src="../assets/images/logo.svg" />
        <h1>Bulletproof</h1>
        <div class="subtitle">I Wish I Was...</div>
      </figure>
      <UiButton v-if="isMobile" @click="expandMenu('navMenu')" size="large" color="primary">Begin</UiButton>
      <div v-else class="invitation">
        Drop font files anywhere to start
      </div>

    </div>
    <WelcomeText class="readme" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import WelcomeText from "@/views/Welcome.md";
import UiButton from "keen-ui/src/UiButton.vue";

export default {
  name: "Welcome",
  components: {
    WelcomeText,
    UiButton,
  },
  props: {},
  computed: {
    ...mapState([
      "isMobile",
    ]),
  },
  mounted() {
    this.$store.commit("scrollToTop");
  },
  methods: {
    expandMenu(menuId) {
      this.$store.commit("expandMenu", { menuId });
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/scss/variables";
@import "@/scss/mixins";

.banner {
  font-size: 6rem;
  text-align: center;
  margin-bottom: 2rem;
  @media (max-width: 1000px) {
    font-size: 10vw;
  }
  .logo {
    height: 4em;
    margin: -1em 0 -0.6em;
    max-width: 100%;
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
  margin-bottom: 80px;
  text-align: center;
  @media (max-width: 1000px) {
    padding-bottom: 0;
    margin-bottom: 60px;
  }
  .ui-button {
    background: $accent-faded;
    margin-top: 1rem;
    padding: .8rem 3.5rem;
    height: unset !important;
  }
}

.readme {
  margin: 20px 0 360px;
  @media (max-width: 1000px) {
    margin: 20px 0 100px;
  }
}
</style>
