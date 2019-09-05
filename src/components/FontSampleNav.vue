<template>
  <div class="font-sample-nav">
    <div class="toolbar">
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

    <div class="nav">
      <div v-for="(heading, i) in textHeadings" :key="i">
        <a :href="`#${heading.id}`">
          {{ heading.text }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import UiIconButton from "keen-ui/src/UiIconButton.vue";

export default {
  components: {
    UiIconButton,
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
@import 'keen-ui/src/styles/imports';

.font-sample-nav {
  padding: 8px;
}
.toolbar {
  display: flex;
  align-items: center;
  margin: 0 -2px;

  .ui-icon-button {
    border: 2px solid $ui-input-border-color;
    border-radius: 0;
    margin: 0 -1px;
    &:hover {
      border-color: $ui-input-border-color--hover;
      z-index: 1;
    }
    $radius: 8px;
    &:first-child {
      border-radius: $radius 0 0 $radius;
    }
    &:last-child {
      border-radius: 0 $radius $radius 0;
    }
  }
}

.toolbar, .nav {
  padding: 4px;
}
</style>
