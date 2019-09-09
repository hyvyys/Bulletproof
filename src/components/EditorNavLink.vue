<template>
  <span class="editor-nav-link nav-link">
    <router-link :to="`/custom/${id}`">
      <div class="middle-ellipsis">
        <div class="start">Custom&nbsp;</div>
        <div class="end">{{ id }}</div>
      </div>
    </router-link>
    <UiIconButton color="secondary" style="color: white" @click="removeCustomText(id)">
      <img svg-inline src="@/assets/icons/close.svg" key="1" />
    </UiIconButton>
  </span>
</template>

<script>
import UiIconButton from "keen-ui/src/UiIconButton.vue";

export default {
  components: {
    UiIconButton,
  },
  props: {
    id: Number,
  },
  methods: {
    removeCustomText(id) {
      this.$store.commit("removeCustomText", { id });
    },
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/dark";

.editor-nav-link {
  margin: 0 3px !important;
  display: inline-flex;
  align-items: center;
  $button-size: 20px;
  min-width: 60px;

  a {
    flex: unset;
    min-width: 0;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .ui-icon-button {
    flex: 0 0 auto;
  }

  .ui-icon-button {
    height: $button-size;
    width: $button-size;
    &:hover {
      // background: rgba($accent, 0.85);
      @include dark;
    }
    svg {
      height: $button-size;
      width: $button-size;
    }
  }
}

.middle-ellipsis {
  white-space: nowrap;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content:flex-start;
}
.start {
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  flex-shrink: 1;
  // direction: rtl;
}
.end {
  white-space:nowrap;
  flex-basis:content;
  flex-grow: 0;
  flex-shrink: 0;
}
</style>
