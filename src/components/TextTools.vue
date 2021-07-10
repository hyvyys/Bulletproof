<template>
  <div class="text-tools font-sample-nav contextual-sidebar">
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
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import UiIconButton from "keen-ui/src/UiIconButton.vue";
import DomSelection from "@/utils/DomSelection";

export default {
  components: {
    UiIconButton,
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

.text-tools {
  overflow: visible;
}

.toolbar {
  margin: 0;
  padding: 0;
  flex: 0 0 auto;
  justify-content: flex-end;
}

.nav-links {
  flex: 1 1 auto;
}

.animation-editor {
  flex: 1 1 auto;
}

</style>
