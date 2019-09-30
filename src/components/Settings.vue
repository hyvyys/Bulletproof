<template>
  <div class="settings">
    <div class="row">
      <label class="row-label">Font size</label>
      <UiNumber
        ref="settingFontSize"
        :value="settings.fontSize"
        :min="settings.minFontSize"
        :max="settings.maxFontSize"
        :step="settings.fontSizeStep"
        :clickStep="settings.fontSizeClickStep"
        @input="v => updateSetting('updateSettings', { fontSize: v })"
      />
      <UiSelect
        ref="settingFontSizeUnit"
        class="const3ch"
        :value="settings.fontSizeUnit"
        :options="settings.fontSizeUnitOptions"
        @input="v => updateSetting('updateSettings', { fontSizeUnit: v })"
      />
    </div>

    <div class="row">
      <label class="row-label">Line height</label>
      <UiNumber
        ref="settingLineHeight"
        :value="settings.lineHeight"
        :min="settings.minLineHeight"
        :max="settings.maxLineHeight"
        :step="settings.lineHeightStep"
        :clickStep="settings.lineHeightClickStep"
        @input="v => updateSetting('updateSettings', { lineHeight: v })"
        :disabled="settings.defaultLineHeight"
      />
      <UiCheckbox
        ref="settingDefaultLineHeight"
        class="checkbox-small"
        :value="settings.defaultLineHeight"
        @input="v => updateSetting('updateSettings', { defaultLineHeight: v })"
      >default</UiCheckbox>
    </div>

    <div class="row">
      <label class="row-label">Text align</label>
      <UiSelect
        ref="settingTextAlign"
        :value="settings.textAlign"
        :options="settings.textAlignOptions"
        @input="v => updateSetting('updateSettings', { textAlign: v })"
      />
    </div>

    <div class="row">
      <label class="row-label">Text color</label>
      <UiColorPicker
        ref="settingTextColor"
        :value="settings.textColor"
        @input="v => updateSetting('updateSettings', { textColor: v })"
      />
    </div>

    <div class="row">
      <label class="row-label">Back color</label>
      <UiColorPicker
        ref="settingBackgroundColor"
        :value="settings.backgroundColor"
        @input="v => updateSetting('updateSettings', { backgroundColor: v })"
      />
    </div>

    <div class="row">
      <label class="row-label">Case transform</label>
      <UiSelect
        ref="settingTextTransform"
        :value="settings.textTransform"
        :options="settings.textTransformOptions"
        @input="v => updateSetting('updateSettings', { textTransform: v })"
      />
    </div>

    <h3 v-if="capFeatures.length > 0">Caps</h3>
    <div class="setting-group">
      <div class="row" v-for="(feature, key) in capFeatures" :key="key">
        <UiCheckbox
          :value="feature.value"
          @input="v => updateSetting('updateGsubFeature', { tag: feature.tag, value: v })"
        >{{ feature.name }}</UiCheckbox>
      </div>
    </div>

    <h3 v-if="localization">Localization</h3>
    <div v-if="localization" class="setting-group">
      <div class="row">
        <UiSelect
          :value="localizationLanguage"
          :options="localizationLanguages"
          :keys="loclSelectKeys"
          placeholder="select language"
          :invalid="isLocalizationInvalid"
          :disabled="onGotchasTab"
          @input="v => updateSetting('updateLoclFeature', { selectedLanguage: v })"
        >
          <div slot="option" slot-scope="props" class="locl-select__option">
            <div class="name">{{ props.option.name }}</div>
            <div v-if="props.option.name !== props.option.tag" class="tag">({{ props.option.tag }})</div>
          </div>
        </UiSelect>

        <UiCheckbox
          class="checkbox-small"
          :value="localization.value"
          @input="v => updateSetting('updateGsubFeature', { tag: 'locl', value: v })"
        >enable</UiCheckbox>
      </div>
    </div>

    <h3 v-if="numberFeatures.length > 0">Numbers</h3>
    <div class="setting-group">
      <div class="row">
        <UiRadioGroup v-if="!!(pnum && tnum)"
          name="figureWidth"
          v-model="figureWidth"
          :options="figureWidths"
          :vertical="true"
        />
        <UiRadioGroup v-if="!!(lnum && onum)"
          name="figureHeight"
          v-model="figureHeight"
          :options="figureHeights"
          :vertical="true"
        />
      </div>
      <div class="row" v-for="(feature, key) in numberFeatures" :key="key">
        <UiCheckbox
          :value="feature.value"
          @input="v => updateSetting('updateGsubFeature', { tag: feature.tag, value: v })"
        >{{ feature.name }}</UiCheckbox>
      </div>
    </div>

    <h3 v-if="stylisticSets.length > 0">Stylistic Sets</h3>
    <div class="setting-group">
      <div class="row" v-for="(feature, key) in stylisticSets" :key="key">
        <UiCheckbox
          :value="feature.value"
          @input="v => updateSetting('updateGsubFeature', { tag: feature.tag, value: v })"
        >{{ feature.friendlyName ? (feature.tag.slice(2) + ' ' + feature.friendlyName) : feature.name }}</UiCheckbox>
      </div>
    </div>

    <h3 v-if="otherGsub.length > 0">Other GSUB</h3>
    <div class="setting-group">
      <div class="row" v-for="(feature, key) in otherGsub" :key="key">
        <UiCheckbox
          :value="feature.value"
          @input="v => updateSetting('updateGsubFeature', { tag: feature.tag, value: v })"
        >{{ feature.name }}</UiCheckbox>
      </div>
    </div>

    <h3 v-if="activeGpos.length > 0">GPOS</h3>
    <div class="setting-group">
      <div class="row" v-for="(feature, key) in activeGpos" :key="key">
        <UiCheckbox
          :value="feature.value"
          @input="v => updateSetting('updateGposFeature', { tag: feature.tag, value: v })"
        >{{ feature.name }}</UiCheckbox>
      </div>
    </div>

    <h3>Variation axes</h3>
    <div class="setting-group">
      <div class="notice" v-if="variationAxes.length === 0">
        The selected font is not variable.
      </div>
      <div class="row" v-for="(axis, key) in variationAxes" :key="key">
        <label class="row-label axis-label">
          {{ axis.displayName }}
        </label>
        <UiSlider
          :value="axis.value"
          @input="v => updateSetting('updateVariationAxis', { tag: axis.tag, value: v })"
          :min="axis.minValue"
          :max="axis.maxValue"
          :step="0.5"
          :snapToStep="true"
          :showMarker="true"
        />
      </div>
    </div>

  </div>
</template>

<script>
// import UiTextbox from "keen-ui/src/UiTextbox.vue";
import { mapGetters } from "vuex";

import UiCheckbox from "keen-ui/src/UiCheckbox.vue";
import UiRadioGroup from "keen-ui/src/UiRadioGroup.vue";
import UiSlider from "keen-ui/src/UiSlider.vue";
import UiSelect from "@/components/UiSelect.vue";
import UiNumber from "@/components/UiNumber.vue";
import UiColorPicker from "@/components/UiColorPicker.vue";

export default {
  name: "Settings",
  components: {
    UiSelect,
    UiCheckbox,
    UiSlider,
    UiRadioGroup,
    UiNumber,
    UiColorPicker,
  },
  props: {
    font: {
      type: Object,
      default: () => null,
    },
  },
  data() {
    return {
      capTags: ["smcp", "c2sc", "pcap", "c2pc"],
      figureTags: ["pnum", "tnum", "lnum", "onum"],
      figureHeights: [
        { value: "default", label: "default" },
        { value: "lnum", label: "lining" },
        { value: "onum", label: "oldstyle" },
      ],
      figureHeight: "default",
      figureWidths: [
        { value: "default", label: "default" },
        { value: "pnum", label: "proportional" },
        { value: "tnum", label: "tabular" },
      ],
      figureWidth: "default",
      numberTags: ["sups", "subs", "numr", "dnom", "frac", "zero"],
      stylisticSetTags: Array(20)
        .fill(0)
        .map((_, i) => `ss${i.toString().padStart(2, "0")}`),
      loclTags: ["locl"],
      loclSelectKeys: {
        class: "class",
        label: "name",
        image: "image",
      },
    };
  },
  computed: {
    ...mapGetters([
      "displayedSettings",
      "animating",
      "selectedSampleKey",
    ]),
    settings() { return this.displayedSettings },

    activeGpos() {
      return this.settings.gposFeatures.filter(f => f.active);
    },
    activeGsub() {
      return this.settings.gsubFeatures.filter(f => f.active);
    },
    capFeatures() {
      return this.getGsubSubset(this.capTags);
    },
    lnum() {
      return this.getGsubFeature("lnum");
    },
    tnum() {
      return this.getGsubFeature("tnum");
    },
    pnum() {
      return this.getGsubFeature("pnum");
    },
    onum() {
      return this.getGsubFeature("onum");
    },
    numberFeatures() {
      return this.getGsubSubset(this.numberTags);
    },
    stylisticSets() {
      return this.getGsubSubset(this.stylisticSetTags);
    },
    localization() {
      return this.getGsubFeature("locl");
    },
    onGotchasTab() {
      return this.selectedSampleKey === "gotchas";
    },
    localizationLanguage() {
      return this.onGotchasTab ? "multiple" : this.localization.selectedLanguage;
    },
    localizationLanguages() {
      return this.localization.languages;
    },
    isLocalizationInvalid() {
      const selected = this.localization.selectedLanguage;
      return selected
        ? !this.localization.languages.find(l => l.tag === selected.tag)
        : false;
    },
    otherGsub() {
      return this.activeGsub.filter(
        f =>
          ![
            ...this.capTags,
            ...this.figureTags,
            ...this.numberTags,
            ...this.stylisticSetTags,
            ...this.loclTags,
          ].includes(f.tag)
      );
    },
    variationAxes() {
      return this.settings.variationAxes;
    },
  },
  watch: {
    figureHeight(val, oldVal) {
      this.setFigureVariant(val, oldVal);
    },
    figureWidth(val, oldVal) {
      this.setFigureVariant(val, oldVal);
    },
  },
  beforeUpdate() {
    this.$parent.$emit("scrollSyncStart")
  },
  updated() {
    this.$parent.$emit("scrollSyncEnd")
  },
  methods: {
    updateSetting(mutation, payload) {
      if (this.animating) return;
      this.$store.commit(mutation, payload);
    },
    getGsubSubset(tags) {
      return this.activeGsub
        .filter(f => tags.includes(f.tag))
        .sort((a, b) => tags.indexOf(a.tag) - tags.indexOf(b.tag));
    },
    getGsubFeature(tag) {
      return this.activeGsub.find(f => tag === f.tag);
    },
    setFigureVariant(val, oldVal) {
      if (oldVal !== "default") {
        this.$store.commit("updateGsubFeature", { tag: oldVal, value: false });
      }
      if (val !== "default") {
        this.$store.commit("updateGsubFeature", { tag: val, value: true });
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import "@/scss/variables";

.settings {
  padding: $sidebar-padding;
}

.checkbox-small.ui-checkbox {
  margin: 0;
  font-size: 1em;
  align-self: center;

  ::v-deep .ui-checkbox__checkmark {
    height: 1rem;
    width: 1rem;
    margin-top: 0.2rem;
  }
  ::v-deep .ui-checkbox__label-text {
    font-size: 1em;
    margin-left: 0.15em;
  }
}

.locl-select__option {
  display: flex;
  width: 100%;

  .name {
    flex: 1;
  }
  .tag {
    margin-left: 0.25em;
    opacity: 0.6;
  }
}

.axis-label {
  min-width: 5em;
  margin: 5px 0;
}

.notice {
  padding: 0.5em 0;
  opacity: 0.7;
  font-size: 0.85rem !important;
}
.row {
  align-items: baseline;
}

</style>
