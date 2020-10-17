<!-- https://github.com/JosephusPaye/Keen-UI/issues/400 -->

<template>
  <div class="ui-color-picker popover-trigger">
    <div class="swatch" :style="`background-color: ${value}`">&nbsp;</div>
    <ui-textbox
      ref="input"
      v-model="textValue"
      @input="updateFromInput"
      :label="label"
      :icon="icon"
      :help="help"
    ></ui-textbox>
    <ui-popover
      class="popover"
      ref="popover"
      position="bottom-start"
      :constrainToScrollParent="false"
      @reveal="$refs.input.focus()"
    >
      <sketch-picker :value="colorValue" @input="updateFromPicker" :disableFields="true"></sketch-picker>
    </ui-popover>
  </div>
</template>

<script>
const TinyColor = require("tinycolor2");

import SketchPicker from "vue-color/src/components/Sketch.vue";
import UiTextbox from "keen-ui/src/UiTextbox";
import UiPopover from "keen-ui/src/UiPopover";

export default {
  components: { UiTextbox, UiPopover, SketchPicker },
  props: {
    value: {
      type: String,
      default: "",
    },

    label: {
      type: String,
      default: "",
    },

    icon: {
      type: String,
      default: "",
    },

    help: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      colorValue: {
        hex: "#000000",
      },
      textValue: this.value,
    };
  },

  mounted() {
    this.updateFromInput();
  },
  methods: {
    openPopover() {
      setTimeout(this.$refs.popover.open, 0);
    },

    updateFromInput() {
      const tiny = TinyColor(this.textValue);
      if (tiny.isValid) {
        this.colorValue = tiny;
        // allow user to choose format
        this.formatText();
        this.update();
      }
    },

    updateFromPicker(color) {
      this.colorValue = TinyColor({ ...color.rgba });
      // force hex format
      this.updateText();
      this.update();
    },

    updateProgrammatically() {
      function toHex8(val) {
        return TinyColor(val).toHex8String();
      }

      if (toHex8(this.value) !== toHex8(this.textValue)) {
        this.colorValue = TinyColor(this.value);
        // force hex format
        this.updateText();
      }
      // this.update(); // don't emit event if set programmatically; should I?
    },

    updateText() {
      this.textValue = this.colorValue.toHex8String();
      // if opacity is full (ff), omit it and return 6 digit hex
      if (/ff$/.test(this.textValue)) {
        this.textValue = this.colorValue.toHexString();
      }
      this.formatText();
    },

    formatText() {
      if (this.colorValue.getFormat() === "hex") {
        if (!/^#/.test(this.textValue)) {
          this.textValue = "#" + this.textValue;
          // this.update();
        }
      }
    },

    update() {
      this.$emit("input", this.textValue);
    },
  },
  watch: {
    value() {
      this.updateProgrammatically();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "keen-ui/src/styles/util.scss";
@import "keen-ui/src/styles/variables.scss";
.ui-color-picker {
  display: flex;
  align-items: baseline;
  .swatch {
    height: 0.8 * $ui-input-height;
    width: 0.8 * $ui-input-height;
    margin: 0 2px;
    box-sizing: border-box;
    background-clip: padding-box;
    border-radius: 5px;
  }
  .ui-textbox {
    flex: 1;
  }
}

.vc-sketch {
  padding: 8px;
  box-shadow: none;
}

$height: 1.2rem;
$preset-size: 1.52rem;

::v-deep .vc-sketch-presets {
  padding: 0;
  margin: 0;
  margin-top: 2px;
}

::v-deep .vc-sketch-presets-color {
  margin: 2px;
  height: $preset-size;
  width: $preset-size;
}

::v-deep .vc-sketch-hue-wrap,
::v-deep .vc-sketch-alpha-wrap {
  height: $height;
}

::v-deep .vc-hue-picker,
::v-deep .vc-alpha-picker {
  height: calc(#{$height} - 2px);
}

::v-deep .vc-sketch-color-wrap {
  display: none;
}
</style>
