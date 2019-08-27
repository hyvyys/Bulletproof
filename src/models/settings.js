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
    options: ["pt", "px", "em", "vw", "vh"],
  },
};
