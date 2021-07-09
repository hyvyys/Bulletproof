<template>
  <span class="editor-nav">
    <EditorNavLink @navigated="$emit('navigated')" v-for="id in customTextIds" :key="id" :id="id" />

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
import EditorNavLink from "@/components/EditorNavLink.vue";

export default {
  components: {
    EditorNavLink,
  },
  computed: {
    ...mapGetters(["customTextIds"]),
  },
};
</script>

<style lang="scss">
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
