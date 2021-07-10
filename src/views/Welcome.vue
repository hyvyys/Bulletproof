<template>
  <div class="welcome reading">
    <div class="fold">
      <figure class="banner">
        <img class="logo" svg-inline src="../assets/images/logo.svg" />
        <h1>Bulletproof</h1>
        <div class="subtitle">I Wish I Was...</div>
      </figure>

      <div class="invitation">
        <div v-if="!isMobile" class="drop-prompt">
          Drop font files to start
        </div>
        <div v-if="!isMobile">or</div>
        <div class="request-font">
          <UiTextbox class="font-url-input" v-model="addFontUrl" placeholder="Enter font file URL (TTF, OTF, WOFF)" @keydown.enter="requestFont"></UiTextbox>
          <UiButton @click="requestFont">Load</UiButton>
        </div>
        <div v-if="isMobile">or</div>
        <UiButton v-if="isMobile" @click="expandMenu('navMenu')">Try with Alegreya</UiButton>
      </div>

    </div>
    <WelcomeText class="readme" />
  </div>
</template>

<script>
import { mapState } from "vuex";
import WelcomeText from "@/views/Welcome.md";
import UiButton from "keen-ui/src/UiButton.vue";
import UiTextbox from "keen-ui/src/UiTextbox.vue";

export default {
  name: "Welcome",
  components: {
    WelcomeText,
    UiButton,
    UiTextbox,
  },
  props: {},
  computed: {
    ...mapState([
      "isMobile",
      "remoteFontRequested",
    ]),
  },
  data() {
    return {
      addFontUrl: '',
    }
  },
  mounted() {
    this.$store.commit("scrollToTop");
  },
  methods: {
    expandMenu(menuId) {
      this.$store.commit("expandMenu", { menuId });
    },
    requestFont() {
      this.$store.commit("requestFont", { url: this.addFontUrl });
    },
  },
};
</script>

<style lang="scss">
@import "@/scss/variables";
@import "@/scss/mixins";

.welcome {
  .banner {
    font-size: 6rem;
    text-align: center;
    margin: 4vw 0 2rem;
    font-size: 4vw;
    @media (max-width: 800px) {
      font-size: 0.04 * 800px;
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
    margin-bottom: 5vw;
    text-align: center;
    @media (max-width: 1000px) {
      margin-bottom: 60px;
    }
  }
  .ui-button {
    background: #ddd;
    &:hover {
      background: #e2e2e2 !important;
    }
    margin-top: 1rem;
    padding: .8rem 3.5rem;
    @media (max-width: 500px) {
      padding: .8rem .5rem;
      font-size: .8rem;
    }
    height: unset !important;
  }

  .readme {
    margin: 20px 0 360px;
    @media (max-width: 1000px) {
      margin: 20px 0 100px;
    }
  }
  .drop-prompt {
    border: 5px dashed #ddd;
    border-radius: 1rem;
    padding: 4vw 2rem;
    margin: 3rem auto 3rem;
  }
  .request-font {
    margin: 1.5rem auto 1rem;
    display: flex;
    align-items: flex-end;
    .ui-textbox {
      flex: 1;
      margin-right: .8rem;
      @media (min-width: 1000px) {
        margin-left: 8rem;
      }
      .ui-textbox__input {
        text-align: center;
        font-size: .9em;
        @media (max-width: 500px) {
          font-size: .8rem;
        }
        padding-bottom: .3rem;
      }
    }
  }
}
</style>
