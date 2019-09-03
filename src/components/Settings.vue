<template>
  <div class="settings">

    <div class="setting-row">
      <label class="row-label">Font size</label>
      <UiNumber
        ref="settingFontSize"
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
    </div>

    <div class="setting-row">
      <label class="row-label">Line height</label>
      <UiNumber
        ref="settingLineHeight"
        :value="settings.lineHeight"
        :min="settings.minLineHeight"
        :max="settings.maxLineHeight"
        :step="settings.lineHeightStep"
        :clickStep="settings.lineHeightClickStep"
        @input="v => $store.commit('updateSettings', { lineHeight: v })"
        :disabled="settings.defaultLineHeight"
      />
      <UiCheckbox
        ref="settingDefaultLineHeight"
        class="checkbox-small"
        :value="settings.defaultLineHeight"
        @input="v => $store.commit('updateSettings', { defaultLineHeight: v })"
      >
      default
      </UiCheckbox>
    </div>

    <div class="setting-row">
      <label class="row-label">Text align</label>
      <UiSelect
        ref="settingTextAlign"
        class=""
        :value="settings.textAlign"
        :options="settings.textAlignOptions"
        @input="v => $store.commit('updateSettings', { textAlign: v })"
      />
    </div>

    <h3 v-if="activeGpos.length > 0">GPOS</h3>
    <div class="setting-group">
      <div class="setting-row" v-for="(feature, key) in activeGpos" :key="key">
        <UiCheckbox
          :value="feature.value"
          @input="v => $store.commit('updateGposFeature', { tag: feature.tag, value: v })"
        >{{ feature.name }}</UiCheckbox>
      </div>
    </div>

    <h3 v-if="capFeatures.length > 0">Caps</h3>
    <div class="setting-group">
      <div class="setting-row" v-for="(feature, key) in capFeatures" :key="key">
        <UiCheckbox
          :value="feature.value"
          @input="v => $store.commit('updateGsubFeature', { tag: feature.tag, value: v })"
        >{{ feature.name }}</UiCheckbox>
      </div>
    </div>

    <h3 v-if="numberFeatures.length > 0">Numbers</h3>
    <div class="setting-group">
      <div class="setting-row" v-for="(feature, key) in numberFeatures" :key="key">
        <UiCheckbox
          :value="feature.value"
          @input="v => $store.commit('updateGsubFeature', { tag: feature.tag, value: v })"
        >{{ feature.name }}</UiCheckbox>
      </div>
    </div>

    <h3 v-if="stylisticSets.length > 0">Stylistic Sets</h3>
    <div class="setting-group">
      <div class="setting-row" v-for="(feature, key) in stylisticSets" :key="key">
        <UiCheckbox
          :value="feature.value"
          @input="v => $store.commit('updateGsubFeature', { tag: feature.tag, value: v })"
        >{{ feature.friendlyName ? (feature.tag.slice(2) + ' ' + feature.friendlyName) : feature.name }}</UiCheckbox>
      </div>
    </div>

    <h3 v-if="otherGsub.length > 0">Other GSUB</h3>
    <div class="setting-group">
      <div class="setting-row" v-for="(feature, key) in otherGsub" :key="key">
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
    return {
      capTags: [
        'smcp',
        'c2sc',
        'pcap',
        'c2pc',
      ],
      numberTags: [
        'sups',
        'subs',
        'numr',
        'dnom',
        'frac',
        'zero',
      ],
      stylisticSetTags: Array(20).fill(0).map((_, i) => `ss${i.toString().padStart(2, '0')}`)
    };
  },
  computed: {
    ...mapGetters(["settings"]),
    activeGpos() { return this.settings.gposFeatures.filter(f => f.active); },
    activeGsub() { return this.settings.gsubFeatures.filter(f => f.active); },
    capFeatures() { return this.getGsubSubset(this.capTags); },
    numberFeatures() { return this.getGsubSubset(this.numberTags); },
    stylisticSets() { return this.getGsubSubset(this.stylisticSetTags); },
    otherGsub() { return this.activeGsub.filter(f => ![
      ...this.capTags,
      ...this.numberTags,
      ...this.stylisticSetTags,
    ].includes(f.tag)); },
  },
  methods: {
    getGsubSubset(tags) {
      return this.activeGsub
        .filter(f => tags.includes(f.tag))
        .sort((a, b) => tags.indexOf(a.tag) - tags.indexOf(b.tag));
    },
  },
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

  margin: 0 -0.2em;
  > * {
    margin: 0 0.2em 2px;
  }
  > .row-label {
    margin-right: 0.3em;
  }
  > :not(label) {
    flex: 1;
  }
  > .row-label,
  /deep/ .ui-checkbox__label-text {
    opacity: 0.7;
    font-size: 0.85em !important;
  }

  @for $i from 1 to 30 {
    .const#{$i}ch {
      display: block;
      flex: 0.1 1 #{$i}ch;
      min-width: #{$i}ch;
    }
  }
}

.checkbox-small.ui-checkbox {
  margin: 0;
  font-size: 1em;
  align-self: center;

  /deep/ .ui-checkbox__checkmark {
    height: 1rem;
    width: 1rem;
    margin-top: 0.2rem;
  }
  /deep/ .ui-checkbox__label-text {
    font-size: 1em;
    margin-left: 0.15em;
  }
}
</style>
