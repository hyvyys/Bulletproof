<script>
const Decimal  = require("decimal.js")

import UiTextbox from "keen-ui/src/UiTextbox.vue";
import UiIconButton from "keen-ui/src/UiIconButton.vue";

export default {
  name: "UiNumber",
  components: { UiIconButton },
  extends: UiTextbox,
  props: {
    value: {
      type: Number,
      default: 1,
    },
    step: {
      type: Number,
      default: 1,
    },
    clickStep: {
      type: Number,
      default: 1,
    },
    clickStepFunction: {
      type: Function,
      default: null,
    },
    minlength: {
      type: Number,
      default: -1,
    },
  },
  data() {
    return {
      displayedText: null, // only set when text is different from value and input is focused
      incrementTimeout: null,
    };
  },
  computed: {
    stringValue() {
      return this.tempValue.toLocaleString();
    },
    _clickStep() {
      return this.clickStepFunction
        ? this.clickStepFunction(this.value)
        : this.clickStep;
    },
  },
  watch: {
    min(val) {
      if (this.value < val) this.updateValue(val);
    },
    max(val) {
      if (this.value > val) this.updateValue(val);
    },
    step() {
      if (this.roundedToStep() !== this.value)
        this.updateValue(this.roundedToStep());
    },
  },
  methods: {
    updateValue(stringOrNumber) {
      let stringValue = String(stringOrNumber);
      let value = Number(stringValue.replace(",", "."));
      if (!isNaN(value)
          // prevent erasing decimal point when user wants to change the fraction part
          && !/[.,]$/.test(stringValue)
      ) {
        const corrected = this.correctValue(value);
        if (Math.abs(value - corrected) < Number.EPSILON) {
          this.displayedText = stringValue;
        } else {
          this.displayedText = null;
        }
        this.$emit("input", corrected);
      }
    },
    correctValue(value) {
      if (typeof this.min == "number") {
        value = Math.max(this.min, value);
      }
      if (typeof this.max == "number") {
        value = Math.min(value, this.max);
      }
      value = this.roundedToStep(value);
      return value;
    },
    onBlur2(e) {
      this.onBlur(e);
      this.displayedText = null;
    },
    roundedToStep(value = this.value) {
      return new Decimal(value).toNearest(this.step).toNumber();
    },
    roundedToClickStep(value = this.value) {
      return new Decimal(value).toNearest(this._clickStep).toNumber();
    },
    getSteps(iteration) {
      return iteration < 2
        ? 1
        : Math.ceil((0.1 * this.value) / this._clickStep);
    },
    getDelay(iteration) {
      return iteration < 2 ? 200 : 100;
    },
    increment(by) {
      this.updateValue(this.roundedToClickStep() + by * this._clickStep);
    },
    decrement(by) {
      this.updateValue(this.roundedToClickStep() - by * this._clickStep);
    },
    startIncrement(e, iteration = 1) {
      const steps = this.getSteps(iteration);
      this.increment(steps);
      this.incrementTimeout = setTimeout(
        () => this.startIncrement(e, iteration + 1),
        this.getDelay(iteration)
      );
    },
    startDecrement(e, iteration = 1) {
      const steps = this.getSteps(iteration);
      this.decrement(steps);
      this.incrementTimeout = setTimeout(
        () => this.startDecrement(e, iteration + 1),
        this.getDelay(iteration)
      );
    },
    endIncrementDecrement() {
      clearTimeout(this.incrementTimeout);
    },
  },
};
</script>

<style lang="scss" scoped>
@import "keen-ui/src/styles/util.scss";
@import "keen-ui/src/styles/variables.scss";

$button-height: 0.5 * $ui-input-height - 0.1rem;
$button-width: $button-height + 0.25rem;

.ui-textbox__input-wrapper {
  display: flex;
  position: relative;
}

.ui-textbox__input {
  box-sizing: border-box;
  padding-right: $button-width + 0.25rem;
  text-align: right;
}

.ui-number-buttons {
  opacity: 0.54;
  transition: opacity 0.3s;
  position: absolute;
  top: 0.1em;
  right: 0;
  display: flex;
  flex-direction: column;

  .ui-number__button {
    height: $button-height;
    width: $button-width;
    min-width: 0;
    padding: 0;
    border-radius: 2px;

    position: relative;

    .ui-icon-button__icon {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      svg {
        height: 0.75em;
        transform: scale(1.5);
      }
    }
  }
}

.ui-number:hover {
  .ui-number-buttons {
    opacity: 1;
    transition: opacity 0.3s;
  }
}
</style>

<template>
  <div class="ui-textbox ui-number" :class="classes">
    <div v-if="icon || $slots.icon" class="ui-textbox__icon-wrapper">
      <slot name="icon">
        <ui-icon :icon="icon"></ui-icon>
      </slot>
    </div>

    <div class="ui-textbox__content">
      <label class="ui-textbox__label">
        <div class="ui-textbox__input-wrapper">
          <input
            ref="input"
            v-autofocus="autofocus"
            class="ui-textbox__input"
            :autocomplete="autocomplete ? autocomplete : null"
            :disabled="disabled"
            :max="maxValue"
            :maxlength="enforceMaxlength ? maxlength : null"
            :minlength="minlength"
            :min="minValue"
            :name="name"
            :number="type === 'number' ? true : null"
            :placeholder="hasFloatingLabel ? null : placeholder"
            :readonly="readonly"
            :required="required"
            :step="stepValue"
            :tabindex="tabindex"
            :type="type"
            :value="displayedText != undefined ? displayedText : value"
            @blur="onBlur2"
            @focus="onFocus"
            @change="updateValue($event.target.value)"
            @input="updateValue($event.target.value)"
            @keydown.enter="onKeydownEnter"
            @keydown="onKeydown"
          />

          <div class="ui-number-buttons">
            <UiIconButton
              class="ui-number__button ui-select__dropdown-button"
              @mousedown.native="startIncrement"
              @mouseleave.native="endIncrementDecrement"
              @mouseup.native="endIncrementDecrement"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path
                  transform="translate(0 24) scale(1 -1) translate(0 -1)"
                  d="M6.984 9.984h10.03L12 15z"
                />
              </svg>
            </UiIconButton>
            <UiIconButton
              class="ui-number__button ui-select__dropdown-button"
              @mousedown.native="startDecrement"
              @mouseleave.native="endIncrementDecrement"
              @mouseup.native="endIncrementDecrement"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                <path transform="translate(0 -1)" d="M6.984 9.984h10.03L12 15z" />
              </svg>
            </UiIconButton>
          </div>
        </div>

        <div v-if="label || $slots.default" class="ui-textbox__label-text" :class="labelClasses">
          <slot>{{ label }}</slot>
        </div>
      </label>

      <div v-if="hasFeedback || maxlength" class="ui-textbox__feedback">
        <div v-if="showError" class="ui-textbox__feedback-text">
          <slot name="error">{{ error }}</slot>
        </div>

        <div v-else-if="showHelp" class="ui-textbox__feedback-text">
          <slot name="help">{{ help }}</slot>
        </div>

        <div v-if="maxlength" class="ui-textbox__counter">{{ valueLength + "/" + maxlength }}</div>
      </div>
    </div>
  </div>
</template>
