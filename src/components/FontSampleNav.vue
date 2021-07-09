<template>
  <div class="font-sample-nav contextual-sidebar">
    <div class="toolbar panel btn-group">
      <UiIconButton
        @click="makeHeading"
        tooltip="Heading"
        :color="isHeadingActive ? 'primary' : 'default'"
      >
        H
      </UiIconButton>
      <UiIconButton
        @click="makeBold"
        tooltip="Bold"
        :color="isBoldActive ? 'primary' : 'default'"
      >
        B
      </UiIconButton>
      <UiIconButton
        @click="makeItalic"
        tooltip="Italic"
        :color="isItalicActive ? 'primary' : 'default'"
      >
        I
      </UiIconButton>
    </div>

    <div class="nav-links">
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
import DomSelection from "@/utils/DomSelection";
import AnimationEditor from "@/components/AnimationEditor.vue";

export default {
  components: {
    UiIconButton,
    AnimationEditor,
  },
  data() {
    return {
      isBoldActive: false,
      isItalicActive: false,
      isHeadingActive: false,
    };
  },
  computed: {
    ...mapGetters([
      "textHeadings",
      "editor",
    ]),
  },
  mounted() {
    document.addEventListener('selectionchange', this.onSelection);
  },
  beforeDestroy() {
    document.removeEventListener('selectionchange', this.onSelection);
  },
  methods: {
    onSelection() {
      if (document.activeElement)
      {
        let sel = new DomSelection(document.activeElement);
        this.isBoldActive = sel.containsTag('strong');
        this.isItalicActive = sel.containsTag('em');
        this.isHeadingActive = sel.containsTag('h3');
      }
    },
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
