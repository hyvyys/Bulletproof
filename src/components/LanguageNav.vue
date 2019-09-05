<template>
  <div class="language-nav">
    <div v-for="(language, i) in visibleLanguages" :key="i">
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
</template>

<script>
import { mapGetters } from "vuex";

import UiCheckbox from "keen-ui/src/UiCheckbox";

export default {
  components: {
    UiCheckbox,
  },
  props: {
  },
  computed: {
    ...mapGetters([
      "visibleLanguages",
    ]),
  },
  data() {
    return {
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
  padding: $vuebar-width;
}

.ui-checkbox {
  display: inline-flex;
}
</style>
