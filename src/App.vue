<template>
  <div class="app">
    <div class="app-content">
      <router-view name="header" />

      <div class="site-content">
        <keep-alive>
          <router-view name="main" />
        </keep-alive>
      </div>

      <router-view name="footer" />
    </div>
    <div class="shade" />
  </div>
</template>

<script>
export default {
  watch: {
    $route(val, oldVal) {
      const p = route => route.path;
      if (p(val) !== p(oldVal)) {
        this.$store.commit("scrollToTop");
      }
    },
  },
  mounted() {
    window.addEventListener("beforeunload", this.someMethod);
    this.$store.commit("setMobile", { isMobile: window.innerWidth <= 1000 });
  },
  beforeDestroy() {
    window.removeEventListener("beforeunload", this.someMethod);
  },
  methods: {
    // eslint-disable-next-line no-unused-vars
    someMethod(event) {
      // event.returnValue = `Are you sure you want to leave?`;
    },
  },
};
</script>

<style lang="scss">
// @import "@/scss/variables.scss";
@import "@/scss/mixins.scss";

.app {
  background: $light;
  color: $light-text;

  height: 100vh;
  overflow-y: hidden;
  .app-content {
    height: 100%;
    overflow: auto;
  }
}

.app-content {
  scroll-padding-top: $header-height + 20px;

  @media screen and (max-width: $mq-max-width) {
    scroll-padding-top: $header-height-mq + 20px;
  }
}

.site-content {
  min-height: 100vh;
}

.shade {
  z-index: 20;
  pointer-events: none;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  @include fade-out(shade-fade-out, 0.3s 0.3s);
}
</style>
