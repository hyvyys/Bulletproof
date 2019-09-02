<template>
  <div class="settings">
    <div class="setting-row">
      <label>Font size</label>
      <UiNumber
        ref="settingFontSize"
        class="const7ch"
        :value="settings.fontSize"
        :min="settings.minFontSize"
        :max="settings.maxFontSize"
        :step="settings.fontSizeStep"
        :clickStep="settings.fontSizeClickStep"
        @input="v => $store.commit('updateSettings', { fontSize: v })"
      />
      <UiSelect
        ref="settingFontSizeUnit"
        class="const4ch"
        :value="settings.fontSizeUnit"
        :options="settings.fontSizeUnitOptions"
        @input="updateFontSizeUnit"
      />
      <!-- <label>{{ fontSizeUnit }}</label> -->
    </div>
    <!-- <div class="setting-row" v-for="(feature, key) in fontFeatureSettings" :key="key">
      <UiCheckbox :value="feature" @input="v => updateFontFeatureSetting(key, v)">{{ key }}</UiCheckbox>
    </div>-->
  </div>
</template>

<script>
// import UiTextbox from "keen-ui/src/UiTextbox.vue";
import { mapGetters } from "vuex";

import UiSelect from "keen-ui/src/UiSelect.vue";
import UiCheckbox from "keen-ui/src/UiCheckbox.vue";
import UiNumber from "@/components/UiNumber.vue";

export default {
  name: "Settings",
  components: { UiSelect, UiCheckbox, UiNumber },
  props: {
    font: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["settings"]),
  },
  methods: {
    updateFontSizeUnit(v) {
      this.$store.commit("updateSettings", { fontSizeUnit: v });
    },
    updateFontFeatureSetting(key, v) {
      // this.fontFeatureSettings[key] = v;
      // console.log(this.fontFeatureSettings);
      // this.$emit("update:fontFeatureSettings", this.fontFeatureSettings);
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/scss/variables";

.settings {
  padding: 5px;
}
.setting-row {
  display: flex;
  width: 100%;
  align-items: baseline;
  > * {
    margin: 0 5px;
  }

  @for $i from 1 to 30 {
    .const#{$i}ch {
      display: block;
      flex: #{$i}ch 0 0;
      width: #{$i}ch;
    }
  }
}
</style>
