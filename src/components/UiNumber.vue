
<template>
  <div class="ui-textbox ui-number" :class="classes" @dblclick.prevent>
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
            inputmode="decimal"
            :max="maxValue"
            :maxlength="enforceMaxlength ? maxlength : null"
            :minlength="minlength"
            :min="minValue"
            :name="name"
            :number="type === 'number' ? true : null"
            :placeholder="hasFloatingLabel ? null : placeholder"
            :readonly="readonly"
            :required="required"
            :tabindex="tabindex"
            :value="displayedText != null ? displayedText : value"
            @blur="onBlur2"
            @focus="onFocus"
            @change="updateValue($event.target.value)"
            @input="updateValue($event.target.value)"
            @keydown.enter="onKeydownEnter"
            @keydown="onKeydown"
            @keydown.up="$event => increment(1, $event)"
            @keydown.down="$event => increment(-1, $event)"
          />

          <UiIconButton
            :disabled="disabled"
            class="ui-number__button up ui-select__dropdown-button"
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
            :disabled="disabled"
            class="ui-number__button down ui-select__dropdown-button"
            @mousedown.native="startDecrement"
            @mouseleave.native="endIncrementDecrement"
            @mouseup.native="endIncrementDecrement"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path transform="translate(0 -1)" d="M6.984 9.984h10.03L12 15z" />
            </svg>
          </UiIconButton>
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
      tryValue: null,
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
    value(val) {
      this.coerceValue(val);
    },
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
          this.$emit("input", corrected);

        // I don't remember what this was about but it broke increasing value from 1.12 to 1.13...
        // if (Math.abs(value - corrected) < Number.EPSILON) {
        //   this.tryValue = null;
        //   this.$emit("input", corrected);
        // } else {
        //   this.tryValue = corrected;
        // }
      }
    },
    coerceValue(value) {
      const corrected = this.correctValue(value);
      // ???
      if (Math.abs(value - corrected) < Number.EPSILON) {
        this.displayedText = null;
        this.$emit("input", corrected);
      }
      else {
        this.displayedText = corrected;
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
      if (this.tryValue != null) {
        this.updateValue(this.tryValue);
        this.tryValue = null;
      }
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
    increment(by, event) {
      by *= event ? (event.ctrlKey ? 100 : event.shiftKey ? 10 : 1) : 1;
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
$button-width: $button-height + 0.75rem;

.ui-textbox__input-wrapper {
  display: grid;
  grid-template-areas: "input up" "input down";
  grid-template-columns: 1fr auto;
  @media (pointer: coarse) {
    grid-template-areas: "down input up";
    grid-template-columns: auto 1fr auto;
  }
  position: relative;
}

.ui-textbox__input {
  grid-area: input;
  box-sizing: border-box;
  text-align: right;
  padding-right: .3em;
}

.ui-number__button {
  &.up {
    grid-area: up;
  }
  &.down {
    grid-area: down;
  }
  opacity: 0.54;
  transition: opacity 0.3s;
  height: auto;
  align-self: stretch;
  width: $button-width;
  min-width: 0;
  padding: 0;
  margin: 0;
  border-radius: 2px;

  @media (pointer: coarse) {
    width: 34px;
    background: #d8d8d8;
    margin: 2px;
  }

  position: relative;

  ::v-deep .ui-icon-button__icon {
    svg {
      height: 0.7em;
      transform: scale(1.5);
    }
  }
  @media (pointer: coarse) {
    svg {
      height: 0.7em;
      transform: scale(1.5, 1.7);
    }
    // svg {
    //   display: none;
    // }
    // &.up .ui-icon-button__icon::after {
    //   content: '+';
    // }
    // &.down .ui-icon-button__icon::after {
    //   content: '-';
    // }
  }
}
.ui-number:not(.is-disabled):hover {
  .ui-number-button {
    opacity: 1;
    transition: opacity 0.3s;
  }
}
</style>
