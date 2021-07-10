<template>
  <UiSelect
    class="font-select"
    :value="value"
    @input="selectOption"
    :options="options"
    :keys="fontOptionKeys"
    dropdownClass="font-select__dropdown"
    :label="label"
    :loading="loading"
    :disabled="loading"
  >

    <!-- Pass on all named slots -->
    <slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot"/>

    <div slot="option" slot-scope="props">
      <template v-if="props.option.addFont">
        <div class="col col-sample icon-add">
          +
        </div>
        <div class="col">
          Add remote font
        </div>
      </template>
      <template v-else>
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
        <UiTooltip position="left" :appendToBody="false" :openDelay="380">
          {{ shortFileName(props.option.fileName) }}
        </UiTooltip>
      </template>
    </div>
  </UiSelect>
</template>

<script>
import UiSelect from "@/components/UiSelect.vue";
import UiTooltip from "@/components/UiTooltip";
import FitMe from "@/components/layout/FitMe.vue";

export default {
  name: 'FontSelect',
  components: {
    UiSelect,
    UiTooltip,
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
        font-family: ${option.cssFamily};
        // font-style: ${option.cssStyle};
        // font-weight: ${option.cssWeight};
        `,
      sampleText: "Abg",
    };
  },
  computed: {
    options() {
      return [
        ...this.fonts,
        { addFont: true },
      ];
    },
  },
  methods: {
    shortFileName(str) {
      return (
        str.length > 22 ? str.slice(0, 8) + '...' + str.slice(-10) : str
      ).replace(/\.(ttf|otf)$/, v => v.toUpperCase());
    },
    selectOption(v) {
      if (v.addFont) {
        this.$emit('openAddFontDialog', v)
      } else {
        this.$emit('input', v)
      }
    },
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
          &.icon-add {
            font-size: 28px;
            font-weight: 700;
            display: flex;
            place-content: center;
            margin: 0;
            padding-bottom: .1em;
            box-sizing: border-box;
          }
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
