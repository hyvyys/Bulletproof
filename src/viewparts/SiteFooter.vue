<template>
  <div class="site-footer">
    <div class="main">
      <div class="subtle">
        <div>
          Bulletproof Font Tester v{{version}}
        </div>
        <div>
          Copyright 2019 Adam Jagosz.
        </div>
      </div>
      <div>
        Sample texts come from
        <a href="https://github.com/hyvyys/language-data" target="_blank">
          Language-Data
        </a>.
        Visit link to contribute.
      </div>
    </div>
    <SigmoidContainer sides="left" direction="top" class="large light aside">
      <a class="github-link" href="https://github.com/hyvyys/Bulletproof" target="_blank">
        <div>
          Bulletproof
          <br />
          on Github
        </div>
        <img
          svg-inline
          height="32"
          width="32"
          alt="Github"
          src="@/assets/icons/github.svg"
        />
      </a>
    </SigmoidContainer>
  </div>
</template>

<script>
const version = require('@/../package.json').version;

import SigmoidContainer from "@/components/layout/SigmoidContainer.vue";

export default {
  components: { SigmoidContainer },
  data() {
    return {
      version,
    }
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/variables.scss";
@import "@/scss/mixins.scss";
@import "@/scss/super-gradient.scss";

@mixin footer-background() {
  background: $accent;
  @include gradient-red-2(0.1, 0.045);
  background-size: 100% 150px;
  background-position: 0 100%;
}

.site-footer {
  display: flex;
  align-items: center;
  min-height: 100px;
  justify-items: space-between;
  padding-bottom: 8px;
  @include footer-background();

  .main {
    color: $accent-text;
    flex: 1;
    padding: 0 20px;
    display: flex;
    align-items: center;
    > :not(:last-child) {
      margin-right: 2em;
    }

    a {
      color: $brand-primary-color;
    }
  }

  .subtle {
    opacity: 0.8;
  }

  .light {
    background: $light;
  }
  .aside {
    align-self: stretch;
    padding-right: $vuebar-width;
    background: $light;
    --adjust-y: 1px;

    .github-link {
      text-decoration: none;
      line-height: 1;
      padding: 0.5em;
      flex: 1;
      overflow: visible;
      display: flex;
      align-items: center;
      div {
        margin: 0.2em;
        text-align: right;
      }
    }
  }
}
</style>
