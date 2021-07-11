<template>
  <div class="kerning-editor panel">
    <transition-group name="fade" class="fade-transition-group" tag="div">
      <div class="row" key="title">
        <h3>
          Pattern segments
        </h3>

        <UiIconButton key="btnAdd" @click="$emit('addKerningSegment')" color="primary" size="small">
          <img svg-inline src="@/assets/icons/add.svg" />
        </UiIconButton>
      </div>

      <div class="row segment-row" v-for="(segment, i) in segments" :key="`segment-${segment.key}`">
        <UiSelect
          ref="segmentSelects"
          v-model="segments[i].characters"
          :options="builtInSegmentCharacters"
          dropdownClass="kerning-segment-select"
          dropdownPosition="bottom-end"
          placeholder="type or choose"
          :autocomplete="true"
          @input="$emit('updateKerningPattern')"
        >
          <template v-slot:option="props">
            <kbd>{{ props.option || "\xa0" }}</kbd>
          </template>
        </UiSelect>

        <UiIconButton key="btnRemove" @click="$emit('removeKerningSegment', i)" color="default" class="border" size="small">
          <img svg-inline src="@/assets/icons/remove.svg" />
        </UiIconButton>
      </div>
    </transition-group>
  </div>
</template>

<script>
import kerningSegments from "@/models/kerningSegments";

import UiIconButton from "keen-ui/src/UiIconButton.vue";
import UiSelect from "@/components/UiSelect.vue";

export default {
  components: {
    UiIconButton,
    UiSelect,
  },
  props: {
    segments: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      builtInSegmentCharacters: ["", ...kerningSegments],
    };
  },
  watch: {
    async segments(val, oldVal) {
      if (this.$refs.segmentSelects && this.$refs.segmentSelects.length) {
        await this.$nextTick();
        let index = 0;
        if (oldVal.length > 0)
          index = this.$refs.segmentSelects.length - 1;
        this.$refs.segmentSelects[index] && this.$refs.segmentSelects[index].focus();
      }
    },
  },
  mounted() {
    if (this.$refs.segmentSelects && this.$refs.segmentSelects.length) {
      this.$refs.segmentSelects[0] && this.$refs.segmentSelects[0].focus();
    }
  },
  updated() {
  },
}
</script>

<style lang="scss" scoped>

.kerning-editor {
  .ui-textbox,
  .ui-select ::v-deep .ui-select__display-value:not(.is-placeholder) {
    font-family: $monospaced;
    font-size: $monospaced-font-size;
  }
}
</style>
