export default class Settings {
  static get definitions() {
    return {
      fontFamily: {
        type: String,
        default: "",
      },
      fallbackFontFamily: {
        type: String,
        default: "sans-serif",
      },

      fontSize: {
        type: Number,
        default: 24,
        validate: (value, settings) => value >= settings.minFontSize && value <= settings.maxFontSize,
      },
      fontSizeUnit: {
        type: String,
        default: "pt",
        kind: "select",
      },
      fontSizeUnitOptions: {
        type: Array,
        default: () => ["pt", "px", "em", "vw", "vh"],
      },

      defaultLineHeight: {
        type: Boolean,
        default: true,
      },
      lineHeight: {
        type: Number,
        default: 1,
        validate: (value, settings) => value >= settings.minLineHeight && value <= settings.maxLineHeight,
      },
      minLineHeight: {
        type: Number,
        default: 0.5,
      },
      maxLineHeight: {
        type: Number,
        default: 3,
      },
      lineHeightStep: {
        type: Number,
        default: 0.01,
      },
      lineHeightClickStep: {
        type: Number,
        default: 0.01,
      },

      textAlign: {
        type: String,
        default: "left",
        kind: "select",
      },
      textAlignOptions: {
        type: Array,
        default: () => ["left", "center", "right", "justify"],
      },

      textColor: {
        type: String,
        default: "#222",
      },
      backgroundColor: {
        type: String,
        default: "#ddd",
      },

      gposFeatures: {
        type: Object,
        default: () => ([]),
      },
      gsubFeatures: {
        type: Object,
        default: () => ([]),
      },
    }
  }

  static getDefaults() {
    const data = {};
    Object.keys(this.definitions).forEach(key => {
      const definition = this.definitions[key];
      const dflt = definition.default;
      if (typeof dflt === "function" && definition.type !== Function) {
        data[key] = dflt();
      } else {
        data[key] = dflt;
      }
    });
    return data;
  }
}
