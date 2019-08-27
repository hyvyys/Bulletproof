<template>
  <div class="settings">
    <div class="setting-row">
    </div>
    <div class="setting-row">
      <label>Font size</label>
      <UiNumber
        ref="settingFontSize"
        class="const7ch"
        :value="fontSize"
        :min="minFontSize"
        :max="maxFontSize"
        :step="fontSizeStep"
        :clickStep="fontSizeClickStep"
        @input="updateNumber"
      />
      <UiSelect
        ref="settingFontSizeUnit"
        class="const4ch"
        :value="fontSizeUnit"
        :options="settings.fontSizeUnit.options"
        @input="updateFontSizeUnit"
      />
      <!-- <label>{{ fontSizeUnit }}</label> -->
    </div>
  </div>
</template>

<script>
// import UiTextbox from "keen-ui/src/UiTextbox.vue";

import UiSelect from "keen-ui/src/UiSelect.vue";
import UiNumber from "@/components/UiNumber.vue";
import convertLength from "@/models/convertLength";

import settings from "@/models/settings";
import computedSettings from "@/models/computedSettings";

export default {
  name: "Settings",
  components: {  UiSelect, UiNumber },
  props: {
    ...settings,
  },
  data() {
    return {
      settings,
    };
  },
  computed: {
    ...computedSettings,
  },
  watch: {
    fontSizeUnit(newUnit, unit) {
      let decimals = String(this.fontSizeStep).replace(/\d+\.?/, "").length;
      let newSize = convertLength({ value: this.fontSize, from: unit, to: newUnit, decimals });
      this.$emit("update:fontSize", parseFloat(newSize));
    },
  },
  methods: {
    getAllSettings() {
      let all = this.$props;
      Object.keys(this.$options.computed).forEach(k => {
        all[k] = this[k];
      });
      return all;
    },
    updateNumber(v) {
      if (settings.fontSize.validate(v, this.getAllSettings())) {
        this.$emit("update:fontSize", v);
      }
    },
    updateFontSizeUnit(newUnit) {
      this.$emit("update:fontSizeUnit", newUnit);
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
