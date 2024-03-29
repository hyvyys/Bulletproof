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
      enableWaterfall: {
        type: Boolean,
        default: false,
      },
      waterfallSizes: {
        type: String,
        // default: '10,12,16,24,26,36,45',
        default: '10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,32,34,36,38,44,64',
        default: '10,14,24,36,64',
      },

      enableLineHeight: {
        type: Boolean,
        default: false,
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

      enableTracking: {
        type: Boolean,
        default: true,
      },
      tracking: {
        type: Number,
        default: 0,
        validate: (value, settings) => value >= settings.minTracking && value <= settings.maxTracking,
      },
      minTracking: {
        type: Number,
        default: -0.5,
      },
      maxTracking: {
        type: Number,
        default: 2,
      },
      trackingStep: {
        type: Number,
        default: 0.001,
      },
      trackingClickStep: {
        type: Number,
        default: 0.01,
      },

      enableWordSpacing: {
        type: Boolean,
        default: true,
      },
      wordSpacing: {
        type: Number,
        default: 0,
        validate: (value, settings) => value >= settings.minWordSpacing && value <= settings.maxWordSpacing,
      },
      minWordSpacing: {
        type: Number,
        default: -1,
      },
      maxWordSpacing: {
        type: Number,
        default: 1,
      },
      wordSpacingStep: {
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
        // default: "#222",
        default: "#000",
      },
      backgroundColor: {
        type: String,
        // default: "#ddd",
        default: "#fff",
      },

      textTransform: {
        type: String,
        default: "uppercase",
        kind: "select",
      },
      textTransformOptions: {
        type: Array,
        default: () => ["none", "uppercase", "capitalize", "lowercase"],
      },
      enableTextTransform: {
        type: Boolean,
        default: false,
      },
      wrapLines: {
        type: Boolean,
        default: false,
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
      enableVariationAxis: {
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
    let variationAxes = settings.variationAxes;
    let weightAxis = variationAxes.find(a => a.tag == 'wght');
    let slantAxis = variationAxes.find(a => a.tag == 'slnt');
    let italicAxis = variationAxes.find(a => a.tag == 'ital');
    let fontStyle = 'normal';
    // if (slantAxis && slantAxis.value != 0) {
    if (slantAxis) {
      fontStyle = `oblique ${-slantAxis.value}deg`;
    } else if (italicAxis && italicAxis.value == 1) {
      fontStyle = 'italic';
    }
    
    const filteredAxes = slantAxis ? ['wght', 'slnt'] : ['wght', 'ital'];

    variationAxes = variationAxes.filter(a => filteredAxes.indexOf(a.tag) == -1);

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
      fontVariationSettings: variationAxes
          .filter(a => a.enabled)
          .map(a => `'${a.tag}' ${a.value} `)
          .join(', ')
          || 'unset',
      fontWeight: weightAxis?.value ?? 400,
      fontStyle,
    };
  }

  static mergeStyleOntoSettings(settings, style) {
    settings.fontSize = parseFloat(style.fontSize);
    settings.lineHeight = parseFloat(settings.lineHeight);
    // settings.textAlign = style.textAlign
    // settings.textTransform = style.textTransform
    settings.textColor = style.color;
    settings.backgroundColor = style.backgroundColor;

    function mapCompoundProp(from, to) {
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
