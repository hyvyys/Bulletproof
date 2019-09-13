<template>
  <div v-bar class="app">
    <div class="app-content">
      <router-view name="header"/>

      <div class="site-content">
        <keep-alive>
          <router-view name="main" />
        </keep-alive>
      </div>

      <router-view name="footer"/>
    </div>
    <div class="shade" />
  </div>
</template>

<script>

export default {
};
</script>

<style lang="scss">
// @import "@/scss/variables.scss";
@import "@/scss/mixins.scss";

.app {
  background: $light;
  color: $light-text;

  /* this is what v-bar applies anyway */
  height: 100vh;
  overflow-y: hidden;
  .app-content {
    height: 100%;
    overflow: auto;
  }

  &.vb {
    > .vb-content {
      padding-right: 0;
    }
    > .vb-dragger {
      > .vb-dragger-styler {
        margin-top: 10px;
        height: calc(100% - 20px);
      }
    }
  }
}

.shade {
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
