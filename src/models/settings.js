export default {
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
