<template>
  <div class="font-tester">
    <transition name="fade-slow" mode='in-out'>
      <div class="font-tester-content" v-show="!fontLoading">

        <Pinnable
          class="site-sidebar sidebar-settings"
          title="Settings"
          :isPinned="true"
          :isVisible="settingsPanelVisible"
          @toggle="$store.commit('toggleSettingsPanel')"
          @hide="$store.commit('toggleSettingsPanel', {value: false})"
          trigger="#settings-trigger"
        >
          <Settings />
        </Pinnable>

        <FontSample
          class="main"
          :html="fontSampleHtml"
          :isCustom="selectedTextKind === 'custom'"
          @update="e => modifyText(e)"
        />

        <Pinnable
          class="site-sidebar sidebar-nav"
          :title="navElementTitle"
          :isPinned="true"
          :isVisible="contextualPanelVisible"
          :scrolled="false"
          @toggle="$store.commit('toggleContextualPanel')"
          @hide="$store.commit('toggleContextualPanel', {value: false})"
          trigger="#nav-trigger"
        >
          <div class="transition-wrapper u-flex-v" style="overflow: hidden;">
            <transition name="swap">
              <component :is="navElement" :key="navElementTitle" />
            </transition>
          </div>
        </Pinnable>
      </div>
    </transition>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";

import Pinnable from "@/components/layout/Pinnable.vue";
import Settings from "@/components/Settings.vue";
import FontSample from "@/components/FontSample.vue";
import LanguageNav from "@/components/LanguageNav.vue";
import KerningNav from "@/components/KerningNav.vue";
import FontSampleNav from "@/components/FontSampleNav.vue";

export default {
  name: "FontTester",
  components: {
    Pinnable,
    Settings,
    FontSample,
    LanguageNav,
    KerningNav,
    FontSampleNav,
  },
  data() {
    return {
      fontSampleHtml: '',
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
    navElement() {
      if (this.visibleLanguages.length > 0) return LanguageNav;
      else if (this.selectedTextKind === 'kerning') return KerningNav;
      else return FontSampleNav;
    },
    navElementTitle() {
      if (this.navElement === LanguageNav) return "Languages";
      else if (this.navElement === KerningNav) return "Kerning";
      else return "Playground";
    },
  },
  watch: {
    selectedTextKind() {
      this.selectSample();
    },
    selectedCustomTextId() {
      this.selectSample();
    },
    selectedSampleKey() {
      this.fontSampleHtml = this.texts[this.selectedSampleKey];
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
  min-height: 100vh;

.font-tester-content {
    padding-right: $vuebar-width;
    flex: 1;
    display: flex;
    height: 100%;
    width: 100vw;
    max-width: 100%;
  }
  z-index: 0;
}

.site-sidebar {
  z-index: 4;
}

.sidebar-settings {
  width: $sidebar-width;
}

.sidebar-nav {
  right: $vuebar-width;
  width: $contextual-sidebar-width;
}
</style>
