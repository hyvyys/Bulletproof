<template>
  <UiSelect
    class="font-select"
    :value="value"
    @input="v => $emit('input', v)"
    :options="fonts"
    :keys="fontOptionKeys"
    dropdownClass="font-select__dropdown"
    :label="label"
    :loading="loading"
    :disabled="loading"
  >

    <!-- Pass on all named slots -->
    <slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot"/>

    <div slot="option" slot-scope="props">
      <div class="col col-sample" :style="optionSampleStyle(props.option)">
        <FitMe
          :text="props.option && sampleText"
          :cutText="2"
        />
      </div>
      <div class="col">
        <div class="font-family">{{ props.option && props.option.originalFamily }}</div>
        <div class="font-style">{{ props.option && props.option.style }}</div>
        <div class="font-version">
          {{
          props.option && props.option.version
          ? `(${props.option.version})` : ""
          }}
        </div>
      </div>
    </div>
  </UiSelect>
</template>

<script>
import UiSelect from "@/components/UiSelect.vue";
import FitMe from "@/components/FitMe.vue";

export default {
  components: {
    UiSelect,
    FitMe,
  },
  props: {
    value: Object,
    fonts: Array,
    label: String,
    loading: Boolean,
  },
  data() {
    return {
      fontOptionKeys: {
        class: "class",
        label: "displayName",
        image: "image",
        key: "displayName",
      },
      optionSampleStyle: option => `
        font-family: ${option.family};
        font-style: ${option.cssStyle};
        font-weight: ${option.cssWeight};
        `,
      sampleText: "Abg",
    };
  },
}
</script>

<style lang="scss">
@import "@/scss/variables";
@import "@/scss/mixins";

.font-select__dropdown {
  width: 250px !important;

  .ui-select-option {
    > div {
      // option
      display: flex;
      align-items: center;
      width: 100%;

      > :not(:last-child) {
        margin-right: 0.3ch;
      }

      .col {
        display: flex;
        align-items: baseline;
        flex-wrap: wrap;
        &:nth-child(2) {
          flex: 1;
        }
        > :not(:last-child) {
          margin-right: 0.3ch;
        }

        &.col-sample {
          margin-left: -0.5em;
          margin-right: 0.45em;
          width: 1.75rem;
          height: 1.5rem;
          line-height: 0.85;
        }
        .font-style {
          opacity: 0.6;
        }
        .font-version {
          flex-grow: 1;
          text-align: right;
        }
      }
    }
  }
}
</style>
