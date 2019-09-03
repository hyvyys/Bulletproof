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
      this.colorValue = TinyColor(this.textValue);
      if (this.colorValue.getFormat() === "hex") {
        if (!/^#/.test(this.textValue)) {
          this.textValue = "#" + this.textValue;
        }
      }
    },

    updateFromPicker(color) {
      this.colorValue = TinyColor({ ...color.rgba });
      const text = this.colorValue.toHex8String();
      this.textValue = /ff$/.test(text) ? this.colorValue.toHexString() : text;
    },
  },
  watch: {
    textValue(val) {
      if (val) {
        this.$emit("input", val);
      }
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

/deep/ .vc-sketch-presets {
  padding: 0;
  margin: 0;
  margin-top: 2px;
}

/deep/ .vc-sketch-presets-color {
  margin: 2px;
  height: $preset-size;
  width: $preset-size;
}

/deep/ .vc-sketch-hue-wrap,
/deep/ .vc-sketch-alpha-wrap {
  height: $height;
}

/deep/ .vc-hue-picker,
/deep/ .vc-alpha-picker {
  height: calc(#{$height} - 2px);
}

/deep/ .vc-sketch-color-wrap {
  display: none;
}
</style>
