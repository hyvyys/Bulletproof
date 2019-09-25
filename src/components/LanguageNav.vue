<template>
  <div class="language-nav contextual-sidebar">

    <div class="row panel">
      <label class="row-label" style="min-width: 0;">Search</label>
      <UiTextbox v-model="languageFilter" />
    </div>

    <div class="panel">
      <div v-for="(language, i) in languages" :key="i">
        <UiCheckbox
          :value="language.isSelected"
          @input="v => toggleLanguage(language.id, v)"
        >
          <a :href="`#${language.language}-${language.id}`">
            {{ language.language }}
          </a>
        </UiCheckbox>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

import UiCheckbox from "keen-ui/src/UiCheckbox";
import UiTextbox from "keen-ui/src/UiTextbox";

export default {
  components: {
    UiCheckbox,
    UiTextbox,
  },
  props: {
  },
  computed: {
    ...mapGetters([
      "visibleLanguages",
    ]),
    languages() {
      return this.visibleLanguages.filter(l => l.language.startsWith(this.languageFilter));
    },
  },
  data() {
    return {
      languageFilter: "",
    };
  },
  mounted() {
  },
  methods: {
    toggleLanguage(id, checked) {
      this.$store.dispatch("selectLanguage", { id, checked });
    },
  },
}
</script>

<style lang="scss" scoped>
.language-nav {
}

.ui-checkbox {
  display: inline-flex;
}
</style>
