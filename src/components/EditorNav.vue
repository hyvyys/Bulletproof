<template>
  <span class="editor-nav">
    <div class="links-wrapper">
      <transition-group class="links" name="fade" key="1">
        <EditorNavLink v-for="id in lessCustomTextIds" :key="id" :id="id" />
      </transition-group>
      <transition-group class="links" name="fade" key="2">
        <EditorNavLink v-for="id in moreCustomTextIds" :key="id" :id="id" />
      </transition-group>
    </div>

    <span
      class="nav-link new"
      key="-1"
    >
      <router-link :to="`/custom/-1`" >
        {{ customTextIds.length > 0 ? '+ New' : 'Editor' }}
      </router-link>
    </span>
  </span>
</template>

<script>
import { mapGetters } from "vuex";
import UiIconButton from "keen-ui/src/UiIconButton.vue";
import UiButton from "keen-ui/src/UiButton.vue";
import UiPopover from "keen-ui/src/UiPopover.vue";
import EditorNavLink from "@/components/EditorNavLink.vue";

export default {
  components: {
    UiIconButton,
    UiButton,
    UiPopover,
    EditorNavLink,
  },
  computed: {
    ...mapGetters(["customTextIds"]),
    boundary() {
      const len = this.customTextIds.length;
      if (len <= 8) return 4;
      else return len / 2;
    },
    lessCustomTextIds() { return this.customTextIds.slice(0, this.boundary); },
    moreCustomTextIds() { return this.customTextIds.slice(this.boundary); },
  },
};
</script>

<style lang="scss" scoped>
@import "@/scss/variables";

.editor-nav {
  text-align: right;
  display: flex;
  align-items: center;
  overflow: hidden;
  .links-wrapper {
    min-width: 0;
  }
  .links {
    display: flex;
    overflow: hidden;
    text-align: right;
    justify-content: flex-end;
  }
  .nav-link {
    display: flex;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    min-width: 0;
    &.new {
      flex: 0 0 auto;
    }
  }
}
</style>
