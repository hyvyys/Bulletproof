<template>
  <div class="font-sample-nav contextual-sidebar">
    <div class="toolbar panel btn-group">
      <UiIconButton
        @click="makeHeading"
        tooltip="Heading"
      >
        H
      </UiIconButton>
      <UiIconButton
        @click="makeBold"
        tooltip="Bold"
      >
        B
      </UiIconButton>
      <UiIconButton
        @click="makeItalic"
        tooltip="Italic"
      >
        I
      </UiIconButton>
    </div>

    <div class="nav-links" v-bar="{
        preventParentScroll: true,
      }"
      ref="vb"
    >
      <div class="scrolled">
        <div class="nav panel">
          <div v-for="(heading, i) in textHeadings" :key="i">
            <a class="heading-link" :href="`#${heading.id}`">
              {{ heading.text }}
            </a>
          </div>
        </div>

       <AnimationEditor />
      </div>
    </div>

  </div>
</template>

<script>
import { mapGetters } from "vuex";
import UiIconButton from "keen-ui/src/UiIconButton.vue";
import AnimationEditor from "@/components/AnimationEditor.vue";

export default {
  components: {
    UiIconButton,
    AnimationEditor,
  },
  computed: {
    ...mapGetters([
      "textHeadings",
    ]),
  },
  methods: {
    makeHeading() {
      this.$store.commit("format", { tag: "h3" });
    },
    makeBold() {
      this.$store.commit("format", { tag: "strong" });
    },
    makeItalic() {
      this.$store.commit("format", { tag: "em" });
    },
  },
}
</script>

<style lang="scss" scoped>
@import "@/scss/mixins";
@import 'keen-ui/src/styles/imports';

.toolbar {
  flex: 0 0 auto;
}

.nav-links {
  flex: 1 1 auto;
}

.animation-editor {
  flex: 1 1 auto;
}

</style>
