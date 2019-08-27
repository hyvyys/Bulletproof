import viewport from "@/models/viewport";

// https://github.com/jwilsson/CSS-Unit-Converter

export class UnitConverter {
  convert(options) {
    /* eslint-disable sort-keys */
    const formulas = {
      "ch-cm": options.value * 0.21087588,
      "ch-em": options.value * 0.5,
      "ch-ex": options.value / 0.9,
      "ch-in": options.value * 0.083022,
      "ch-mm": options.value * 2.1087588,
      "ch-pc": options.value * 0.5,
      "ch-pt": options.value * 5.977584,
      "ch-%": options.value * 50,
      "ch-px": options.value * options.base * 0.5,

      "cm-ch": options.value / 0.21087588,
      "cm-em": options.value / 0.42175176,
      "cm-ex": options.value / 0.189788292,
      "cm-in": options.value * 0.39,
      "cm-mm": options.value * 10,
      "cm-pc": options.value / 0.42175176,
      "cm-pt": options.value * 28.3464566929,
      "cm-%": (((options.value / options.base) * 100) / 2.54) * options.dpi,
      "cm-px": (options.value / 2.54) * options.dpi,

      "em-ch": options.value / 0.5,
      "em-cm": options.value * 0.42175176,
      "em-ex": options.value / 0.45,
      "em-in": options.value * 0.166044,
      "em-mm": options.value / 0.237106301584,
      "em-pc": options.value,
      "em-pt": options.value * 11.955168,
      "em-%": options.value * 100,
      "em-px": options.value * options.base,
      "em-vh": (100 * options.value * options.base) / viewport.height,
      "em-vw": (100 * options.value * options.base) / viewport.width,

      "ex-ch": options.value * 0.9,
      "ex-cm": options.value * 0.189788292,
      "ex-em": options.value * 0.45,
      "ex-in": options.value * 0.0747198,
      "ex-mm": options.value * 1.89788292,
      "ex-pc": options.value * 0.45,
      "ex-pt": options.value * 5.3798256,
      "ex-%": options.value * 45,
      "ex-px": options.value * options.base * 0.45,

      "in-ch": options.value / 0.083022,
      "in-cm": options.value * 2.54,
      "in-em": options.value / 0.166044,
      "in-ex": options.value / 0.0747198,
      "in-mm": options.value * 2.54 * 10,
      "in-pc": options.value / 0.166044,
      "in-pt": options.value / 0.014842519685,
      "in-%": (options.value / options.base) * 100 * options.dpi,
      "in-px": options.value * options.dpi,

      "mm-ch": options.value / 2.1087588,
      "mm-cm": options.value / 10,
      "mm-em": options.value * 0.237106301584,
      "mm-ex": options.value / 1.89788292,
      "mm-in": (options.value * 0.39) / 10,
      "mm-pc": options.value / 4.42175176,
      "mm-pt": options.value / 0.352777777778,
      "mm-%": ((((options.value / options.base) * 100) / 2.54) * options.dpi) / 10,
      "mm-px": ((options.value / 2.54) * options.dpi) / 10,

      "pc-ch": options.value / 0.5,
      "pc-cm": options.value * 0.42175176,
      "pc-em": options.value,
      "pc-ex": options.value / 0.45,
      "pc-in": options.value * 0.166044,
      "pc-mm": options.value * 4.42175176,
      "pc-pt": options.value / 0.0836458341698,
      "pc-%": options.value * 100,
      "pc-px": options.value * options.base,

      "pt-ch": options.value / 5.977584,
      "pt-cm": options.value / 28.3464566929,
      "pt-em": options.value / 11.955168,
      "pt-ex": options.value / 5.3798256,
      "pt-in": options.value * 0.014842519685,
      "pt-mm": options.value * 0.352777777778,
      "pt-pc": options.value * 0.0836458341698,
      "pt-%": (options.value / (options.base - 4)) * 100,
      "pt-px": (options.value * 96) / 72,
      "pt-vh": (100 * options.value * 96) / 72 / viewport.height,
      "pt-vw": (100 * options.value * 96) / 72 / viewport.width,

      "%-ch": options.value / 50,
      "%-cm": (((options.value * options.base) / 100) * 2.54) / options.dpi,
      "%-em": options.value / 100,
      "%-ex": options.value / 45,
      "%-in": (options.value * options.base) / 100 / options.dpi,
      "%-mm": ((((options.value * options.base) / 100) * 2.54) / options.dpi) * 10,
      "%-pc": options.value / 100,
      "%-pt": (options.value * (options.base - 4)) / 100,
      "%-px": (options.value * options.base) / 100,

      "px-ch": options.value / options.base / 0.5,
      "px-cm": (options.value * 2.54) / options.dpi,
      "px-em": options.value / options.base,
      "px-ex": options.value / options.base / 0.45,
      "px-in": options.value / options.dpi,
      "px-mm": ((options.value * 2.54) / options.dpi) * 10,
      "px-pc": options.value / options.base,
      "px-pt": (options.value * 72) / 96,
      "px-%": (options.value / options.base) * 100,
      "px-vh": (options.value / viewport.height) * 100,
      "px-vw": (options.value / viewport.width) * 100,

      "vh-px": (options.value * viewport.height) / 100,
      "vh-pt": ((72 / 96) * options.value * viewport.height) / 100,
      "vh-em": (options.value * viewport.height) / 100 / options.base,
      "vh-vw": (options.value * viewport.height) / viewport.width,

      "vw-px": (options.value * viewport.width) / 100,
      "vw-pt": ((72 / 96) * options.value * viewport.width) / 100,
      "vw-em": (options.value * viewport.width) / 100 / options.base,
      "vw-vh": (options.value * viewport.width) / viewport.height,
    };
    /* eslint-enable sort-keys */

    const units = `${options.from}-${options.to}`;
    const result = formulas[units];

    if (isNaN(result)) {
      return false;
    }

    return this.round(result, options.decimals) + options.to;
  }

  getUnits() {
    return ["ch", "cm", "em", "ex", "in", "mm", "pc", "pt", "%", "px"];
  }

  round(number, decimals) {
    return Math.round(number * 10 ** decimals) / 10 ** decimals;
  }
}

export default function convertLength({ base = 16, decimals = 2, dpi = 72, from, to, value } = {}) {
  const converter = new UnitConverter();
  const result = converter.convert({ base, decimals, dpi, from, to, value });
  return result;
}
