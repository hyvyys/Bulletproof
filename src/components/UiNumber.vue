<script>
import UiTextbox from "keen-ui/src/UiTextbox.vue";
import UiIconButton from "keen-ui/src/UiIconButton.vue";

export default {
  name: "UiNumber",
  components: { UiIconButton },
  extends: UiTextbox,
  props: {
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
      tempValue: this.value, // non-conforming to this.step
      incrementTimeout: null,
    };
  },
  computed: {
    stringValue() {
      return this.tempValue.toLocaleString();
    },
    _clickStep() {
      return this.clickStepFunction ? this.clickStepFunction(this.value) : this.clickStep;
    },
  },
  watch: {
    value(val) {
      this.tempValue = val;
    },
    min(val) {
      this.tempValue = this.value;
      if (this.value < val) this.updateValue(val);
    },
    max(val) {
      this.tempValue = this.value;
      if (this.value > val) this.updateValue(val);
    },
    step() {
      this.tempValue = this.value;
      if (this.roundedToStep() !== this.value) this.updateValue(this.roundedToStep());
    },
  },
  methods: {
    updateValue(value) {
      value = String(value).replace(",", ".");
      let valid = parseFloat(value);
      // entered text is a number and not gibberish
      if (String(valid) === value) {
        valid = Math.min(Math.max(this.min, valid), this.max);
        valid = this.roundedToStep(valid);
        if (valid === this.roundedToStep(valid)) {
          this.tempValue = valid;
        }
        this.$emit("input", valid);
      }
    },
    onBlur2(e) {
      this.onBlur(e);
      this.tempValue = this.value; // remove extra decimals / round to step
    },
    roundedToStep(value = this.value) {
      return Math.round(value / this.step) * this.step;
    },
    roundedToClickStep(value = this.value) {
      return Math.round(value / this._clickStep) * this._clickStep;
    },
    getSteps(iteration) {
      return iteration < 2 ? 1 : Math.ceil((0.1 * this.value) / this._clickStep);
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
@import "keen-ui/src/styles/variables.scss";

$button-width: 0.9em;
$button-height: 0.6em;

.ui-textbox__input-wrapper {
  display: flex;
  position: relative;
}

.ui-textbox__input {
  box-sizing: border-box;
  padding-right: $button-width + 0.25em;
  text-align: right;
}

.ui-number-buttons {
  opacity: 0.54;
  transition: opacity 0.3s;
  position: absolute;
  top: 0.375em;
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
        height: $button-height;
        transform: scale(1.8);
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
            :value="stringValue"
            @blur="onBlur2"
            @change="onChange"
            @focus="onFocus"
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

        <div v-if="maxlength" class="ui-textbox__counter">
          {{ valueLength + "/" + maxlength }}
        </div>
      </div>
    </div>
  </div>
</template>
