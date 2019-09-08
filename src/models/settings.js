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

      textTransform: {
        type: String,
        default: "none",
        kind: "select",
      },
      textTransformOptions: {
        type: Array,
        default: () => ["none", "uppercase", "capitalize", "lowercase"],
      },

      gposFeatures: {
        type: Object,
        default: () => ([]),
      },
      gsubFeatures: {
        type: Object,
        default: () => ([]),
      },
      variationAxes: {
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

  static getStyleFromSettings(settings) {
    return {
      fontSize: settings.fontSize,
      lineHeight: settings.lineHeight,
      textAlign: settings.textAlign,
      textTransform: settings.textTransform,
      color: settings.textColor,
      backgroundColor: settings.backgroundColor,
      fontFeatureSettings: settings.gsubFeatures.concat(settings.gposFeatures)
          .map(f => `'${f.tag}' ${f.value ? '1' : '0'} `)
          .join(', '),
      fontVariationSettings: settings.variationAxes
          .map(a => `'${a.tag}' ${a.value} `)
          .join(', '),
    };
  }

  static mergeStyleOntoSettings(settings, style) {
    settings.fontSize = parseFloat(style.fontSize),
    settings.lineHeight = parseFloat(settings.lineHeight),
    // settings.textAlign = style.textAlign
    // settings.textTransform = style.textTransform
    settings.textColor = style.color
    settings.backgroundColor = style.backgroundColor

    function mapCompoundProp(from, to) {
      // debugger
      const features = {};
      (style[from] || "").split(/, ?/g).filter(s => s).map(f => {
        let match = f.match(/[a-z]{4}/i);
        if (match) {
          const tag = match[0];
          match = f.match(/ \d+/);
          const val = match ? parseInt(match[0]) : 1;
          features[tag] = val;
        }
      });
      settings[to].forEach((f, i) => {
        if (f.tag in features) {
          settings[to][i].value = features[f.tag];
        }
      });
    }
    mapCompoundProp("fontFeatureSettings", "gsubFeatures");
    mapCompoundProp("fontFeatureSettings", "gposFeatures");
    mapCompoundProp("fontVariationSettings", "variationAxes");
  }
}
