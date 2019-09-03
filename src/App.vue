<template>
  <div v-bar class="app">
    <div class="app-content">
      <div class="fold-wrapper">
        <router-view name="header"/>
        <keep-alive>
          <router-view name="main" />
        </keep-alive>
      </div>

      <SiteFooter></SiteFooter>
    </div>
    <div class="shade" />
  </div>
</template>

<script>
import SiteFooter from "./viewparts/SiteFooter.vue";

export default {
  components: { SiteFooter },
};
</script>

<style lang="scss">
// @import "@/scss/variables.scss";
@import "@/scss/mixins.scss";

.app {
  background: $light;
  color: $light-text;
  height: 100vh;
  overflow-y: scroll;

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

// keeps footer below the fold
.fold-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  overflow-x: hidden;
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
