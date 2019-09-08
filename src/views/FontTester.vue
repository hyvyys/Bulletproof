<template>
  <div class="font-tester">
    <Fitter
      class="settings-wrapper"
      :scrolledParentSelector="scrolledParentSelector"
      bottomSelector=".site-footer"
      topSelector=".site-header"
    >
      <Settings />
    </Fitter>
    <FontSample
      :html="texts[selectedSampleKey]"
      @update="e => modifyText(e)"
    />

      <Fitter
        class="nav-wrapper"
        :scrolledParentSelector="scrolledParentSelector"
        bottomSelector=".site-footer"
        topSelector=".site-header"
        trigger="#nav-trigger"
      >
        <div class="transition-wrapper">
          <transition name="swap">
            <LanguageNav v-if="visibleLanguages.length > 0" />
            <KerningNav v-else-if="selectedTextKind === 'kerning'" />
            <FontSampleNav v-else />
          </transition>
        </div>
      </Fitter>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import Fitter from "@/components/layout/Fitter.vue";
import Settings from "@/components/Settings.vue";
import FontSample from "@/components/FontSample.vue";
import LanguageNav from "@/components/LanguageNav.vue";
import KerningNav from "@/components/KerningNav.vue";
import FontSampleNav from "@/components/FontSampleNav.vue";

export default {
  name: "FontTester",
  components: {
    Fitter,
    Settings,
    FontSample,
    LanguageNav,
    KerningNav,
    FontSampleNav,
  },
  data() {
    return {
    };
  },
  computed: {
    selectedTextKind() {
      return this.$route.params.text;
    },
    selectedCustomTextId() {
      return Number(this.$route.params.id);
    },
    ...mapGetters([
      "scrolledParentSelector",
      "texts",
      "selectedSampleKey",
      "visibleLanguages",
    ]),
    fontSampleHtml() {
      return this.texts[this.selectedSampleKey];
    },
  },
  watch: {
    selectedTextKind() {
      this.selectSample();
    },
    selectedCustomTextId() {
      this.selectSample();
    },
  },
  beforeMount() {
    this.$store.commit("resetSettings");
    this.selectSample();
  },
  mounted() {},
  methods: {
    selectSample() {
      const kind = this.selectedTextKind;
      const id = this.selectedCustomTextId;
      this.$store.dispatch("selectSample", { kind, id });
    },
    modifyText(e) {
      this.$store.commit("modifyText", e);
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/scss/variables";
@import "@/scss/mixins";

.font-tester {
  flex: 1;
  display: flex;
  height: 100vh;
  // position: relative;
}
.settings-wrapper {
  min-width: $sidebar-width;
  width: $sidebar-width;
}
.nav-wrapper {
  width: 0;

  ::v-deep .positioned {
    background: $light;
    right: $vuebar-width;
    width: $contextual-sidebar-width;
    @include pseudo;
    &::after {
      left: 100%;
      background: $light;
      width: $vuebar-width;
    }
  }
}
</style>
