import convertLength from "@/models/convertLength";

//expects this to be the settings object

export default {
  minFontSize: function() {
    switch (this.fontSizeUnit) {
      case "px":
        return 4;
      default: {
        const value = convertLength({ from: "px", value: 4, to: this.fontSizeUnit });
        return parseFloat(value);
      }
    }
  },
  maxFontSize: function() {
    switch (this.fontSizeUnit) {
      case "px":
        return 1000;
      default: {
        const value = convertLength({ from: "px", value: 1000, to: this.fontSizeUnit });
        return parseFloat(value);
      }
    }
  },
  fontSizeStep: function() {
    switch (this.fontSizeUnit) {
      case "pt":
        return 0.5;
      case "px":
        return 1;
      case "vw":
      case "vh":
      case "em":
        return 0.01;
      default:
        return 0.01;
    }
  },
  fontSizeClickStep: function() {
    switch (this.fontSizeUnit) {
      case "px":
      case "pt":
      case "vw":
      case "vh":
        return 1;
      case "em":
        return 0.5;
      default:
        return 1;
    }
  },
};
