<template>
  <div class="site-footer">
    <div class="sentinel" ref="sentinel"/>
    <div class="main u-dark">
      <div>
        <div>
          Sample texts from
          <a href="https://github.com/hyvyys/language-data" target="_blank">
            Language-Data
          </a>.
          Visit link to contribute.
        </div>
        <div>
          <a href="https://github.com/huertatipografica/Alegreya-Sans">Alegreya Sans</a> font by Juan Pablo del Peral.
        </div>
        <div>
          <a href="https://github.com/etunni/Graduate-Variable-Font">Graduate</a> Variable Font by Eduardo Tunni.
        </div>
        <div>
          Rywalka font by Adam Jagosz.
        </div>
      </div>

      <div class="bulletproof-info">
        <div>
          Bulletproof Font Tester
        </div>
        <div>
          Copyright 2019 Adam Jagosz.
        </div>
      </div>
    </div>
    <SigmoidContainer sides="left bottom" width="65" class="large light aside" idSeed="footer">
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
  mounted() {
    this.initObserver();
  },
  destroyed() {
    this.observer.disconnect();
  },
  methods: {
    initObserver() {
      let options = { threshold: [0, 0.25, 0.5, 0.75, 1] };
      // eslint-disable-next-line no-unused-vars
      let callback = (entries, observer) => {
        entries.forEach(entry => {
          this.updateHeight(entry);
        });
      };
      this.observer = new IntersectionObserver(callback, options);
      this.observer.observe(this.$refs.sentinel);
    },
    updateHeight(entry) {
      // const height = entry.intersectionRect.height;
      const ratio = entry.intersectionRatio;
      this.$store.commit("updateFooter", { visible: ratio > 0.75, ratio });
    },
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
  position: relative;
  .sentinel {
    position: absolute;
    bottom: 100%;
    height: $footer-height;
    width: 100%;
    pointer-events: none;
  }

  display: flex;
  height: $footer-height;
  justify-items: space-between;
  padding-bottom: 8px;
  @include footer-background();

  .main {
    color: rgba($accent-text, 0.7);
    font-size: 0.9rem;
    flex: 1;
    padding: 15px 20px 10px;
    display: flex;
    align-items: center;
    > :not(:last-child) {
      margin-right: 2em;
    }
  }

  .bulletproof-info {
    flex: 1;
    text-align: center;
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
