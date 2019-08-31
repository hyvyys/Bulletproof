export default {
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
    default: 12,
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
  fontFeatureSettings: {
    type: Object,
    default: () => ({}),
  },
};
