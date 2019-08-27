var opentype = require("opentype.js");
import util from "util";
const loadFont = util.promisify(opentype.load);

import fontFeatureNames from "./fontFeatureNames";

export default class FontParser {
  static async parse(url, callback) {
    const font = new Font();
    if (!callback) {
      return font.init(url);
    } else {
      font.init(url).then(({ font, error }) => {
        if (font) callback(font);
        if (error) callback(null, error);
      });
    }
  }
}

class Font {
  init(url) {
    return new Promise((resolve) => {
      this.url = url;
      loadFont(url)
        .then(font => {
          this.processFont(font);
          resolve({ font: this });
        })
        .catch(error => {
          resolve({ error });
        });
    });
  }

  processFont(font) {
    this.getNames(font);
    // this.getFeatures(font);
    this.generateFontFace();
  }

  getNames(font) {
    const names = font.names;
    this.family = (names.preferredFamily && names.preferredFamily.en) || names.fontFamily.en;
    this.style =
      (names.preferredSubfamily && names.preferredSubfamily.en) || names.fontSubfamily.en;

    this.cssStyle = /(italic|oblique)/gi.test(this.style) ? "italic" : "normal";
    this.cssWeight = font.tables.os2.usWeightClass;
  }

  getFeatures(font) {
    const names = font.names;
    const gpos = font.tables.gpos;
    const gsub = font.tables.gsub;

    const loclLanguages = new Set(
      [...(gpos.scripts || []), ...(gsub.scripts || [])].flatMap(s => s.script.langSysRecords).map(lsr => lsr.tag)
    );

    const stylisticSetNames = Object.getOwnPropertyNames(names)
      .filter(p => /\d+/.test(p))
      .map(p => names[p].en);
    let i = 0;
    const getStylisticSetName = function () {
      return stylisticSetNames[i++];
    };

    this.gposFeatures = (gpos.features || []).map(f => ({
      tag: f.tag,
      name: fontFeatureNames[f.tag] || f.tag,
    }));

    this.gsubFeatures = [];

    (gsub.features || []).forEach(f => {
      const feature = {
        tag: f.tag,
        name: fontFeatureNames[f.tag] || f.tag,
      };

      if (f.tag == "locl") {
        feature.languages = loclLanguages;
      } else if (/ss\d\d/.test(f.tag)) {
        feature.friendlyName = getStylisticSetName();
      }
      const duplicate = this.gsubFeatures.find(ff => ff.tag == f.tag);
      if (!duplicate) {
        this.gsubFeatures.push(feature);
      }
    });

    this.variationAxes = (font && font.tables.fvar && font.tables.fvar.axes) || [];
  }

  generateFontFace() {
    this.fontFace = `
      @font-face {
        font-family: ${this.family};
        font-style: ${this.cssStyle};
        font-weight: ${this.cssWeight};
        src: url('${this.url}');
      }
    `;
  }
}
