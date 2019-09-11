<template>
  <div class="font-tester">
    <transition name="fade-slow" mode='in-out'>
      <div class="font-tester-content" v-show="!fontLoading">
        <Fitter
          title="Settings"
          :isPinned="true"
          :isVisible="settingsPanelVisible"
          @toggle="$store.commit('toggleSettingsPanel')"
          @hide="$store.commit('toggleSettingsPanel', {value: false})"
          trigger="#settings-trigger"
          class="settings-wrapper"
          :scrolledParentSelector="scrolledParentSelector"
          bottomSelector=".site-footer"
          topSelector=".site-header"
        >
          <Settings />
        </Fitter>

        <FontSample
          :html="texts[selectedSampleKey]"
          :wordBreak="wordBreak"
          @update="e => modifyText(e)"
        />

        <Fitter
          :title="navElementTitle"
          :isPinned="false"
          :isVisible="contextualPanelVisible"
          @toggle="$store.commit('toggleContextualPanel')"
          @hide="$store.commit('toggleContextualPanel', {value: false})"
          trigger="#nav-trigger"
          class="nav-wrapper"
          :scrolledParentSelector="scrolledParentSelector"
          bottomSelector=".site-footer"
          topSelector=".site-header"
        >
          <div class="transition-wrapper">
            <transition name="swap">
              <component :is="navElement" :key="navElementTitle" />
            </transition>
          </div>
        </Fitter>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

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
    ...mapState([
      "fontLoading",
      "settingsPanelVisible",
      "contextualPanelVisible",
    ]),
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
    navElement() {
      if (this.visibleLanguages.length > 0) return LanguageNav;
      else if (this.selectedTextKind === 'kerning') return KerningNav;
      else return FontSampleNav;
    },
    navElementTitle() {
      if (this.navElement === LanguageNav) return "Languages";
      else if (this.navElement === KerningNav) return "Kerning editor";
      else return "Playground";
    },
    wordBreak() {
      return this.selectedTextKind === 'kerning' ? 'break-all' : 'normal';
    }
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
  .font-tester-content {
    flex: 1;
    display: flex;
    overflow: auto;
    width: 100vw;
  }
  z-index: 0;
}
.settings-wrapper {
  width: $sidebar-width;
  ::v-deep .positioned {
    width: $sidebar-width;
    background: $light;
  }
}
.nav-wrapper {
  width: $contextual-sidebar-width + $vuebar-width;

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
