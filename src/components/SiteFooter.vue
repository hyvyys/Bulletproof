<template>
  <div class="site-footer">
    <div class="main">
      Copyright 2019 Adam Jagosz
    </div>
    <SigmoidContainer sides="left" direction="top" class="large light aside">
      <div class="github-link">
        <div>
          Bulletproof
          <br />
          on Github
        </div>
        <a href="https://github.com/hyvyys/Bulletproof">
          <img
            height="32"
            width="32"
            alt="Github"
            src="https://unpkg.com/simple-icons@latest/icons/github.svg"
          />
        </a>
      </div>
    </SigmoidContainer>
  </div>
</template>

<script>
import SigmoidContainer from "./layout/SigmoidContainer.vue";

export default {
  components: { SigmoidContainer },
};
</script>

<style lang="scss" scoped>
@import "@/scss/variables.scss";
@import "@/scss/mixins.scss";
@import "@/scss/super-gradient.scss";

@mixin footer-background() {
  background: $accent;
  @include gradient-red;
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

  /* cover up aside's sigmoid container --adjust-y */
  border-top: 1px solid $light;

  .main {
    color: $accent-text;
    flex: 1;
    padding: 0 20px;
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
