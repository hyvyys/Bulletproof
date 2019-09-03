<template>
  <div class="settings">
    <div class="setting-row">
      <label>Font size</label>
      <UiNumber
        ref="settingFontSize"
        class=""
        :value="settings.fontSize"
        :min="settings.minFontSize"
        :max="settings.maxFontSize"
        :step="settings.fontSizeStep"
        :clickStep="settings.fontSizeClickStep"
        @input="v => $store.commit('updateSettings', { fontSize: v })"
      />
      <UiSelect
        ref="settingFontSizeUnit"
        class="const3ch"
        :value="settings.fontSizeUnit"
        :options="settings.fontSizeUnitOptions"
        @input="v => $store.commit('updateSettings', { fontSizeUnit: v })"
      />
      <!-- <label>{{ fontSizeUnit }}</label> -->
    </div>
    <div class="setting-row">
      <label>Text align</label>
      <UiSelect
        ref="settingTextAlign"
        class=""
        :value="settings.textAlign"
        :options="settings.textAlignOptions"
        @input="v => $store.commit('updateSettings', { textAlign: v })"
      />
    </div>
    <h3>GPOS</h3>
    <div class="setting-group">
      <div class="setting-row" v-for="(feature, key) in settings.gposFeatures" :key="key">
        <UiCheckbox
          :value="feature.value"
          @input="v => $store.commit('updateGposFeature', { tag: feature.tag, value: v })"
        >{{ feature.name }}</UiCheckbox>
      </div>
    </div>
    <h3>GSUB</h3>
    <div class="setting-group">
      <div class="setting-row" v-for="(feature, key) in settings.gsubFeatures" :key="key">
        <UiCheckbox
          :value="feature.value"
          @input="v => $store.commit('updateGsubFeature', { tag: feature.tag, value: v })"
        >{{ feature.name }}</UiCheckbox>
      </div>
    </div>
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
  methods: {},
};
</script>

<style scoped lang="scss">
@import "@/scss/variables";

.settings {
  padding: 5px;

  h3 {
    margin: 4px 0 0 0;
    font-size: 1em;
  }
}
.setting-row {
  display: flex;
  width: 100%;
  align-items: baseline;

  margin: 0 -0.3em;
  > * {
    margin: 0 0.3em 0.15em;
  }
  > :not(label) {
    flex: 1;
  }
  label {
    opacity: 0.7;
    font-size: 0.85em;
  }

  @for $i from 1 to 30 {
    .const#{$i}ch {
      display: block;
      flex: 0.1 1 #{$i}ch;
      min-width: #{$i}ch;
    }
  }
}
</style>
