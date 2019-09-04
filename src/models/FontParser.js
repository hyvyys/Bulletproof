var opentype = require("opentype.js");
import util from "util";
const loadFont = util.promisify(opentype.load);

import opentypeLanguageTags from "./opentypeLanguageTags";
import opentypeFeatureNames from "./opentypeFeatureNames";
import findHtmlTag from "language-data/src/LanguageDataParser/findHtmlTag";

function findFeatureName(tag) {
  const match = opentypeFeatureNames.find(f => f.tag.test(tag));
  return match && match.name || tag;
}

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
      this.version = 0;
      this.url = url;
      loadFont(url)
        .then(font => {
          this.font = font;
          this.processFont();
          resolve({ font: this });
        })
        .catch(error => {
          resolve({ error });
        });
    });
  }

  serialize() {
    // eslint-disable-next-line no-unused-vars
    const { font, ...obj } = this;
    return obj;
  }

  processFont() {
    this.getNames();
    this.getFeatures();
    this.generateFontFace();
  }

  getNames() {
    const font = this.font;
    const names = font.names;
    this.family = (names.preferredFamily && names.preferredFamily.en) || names.fontFamily.en;
    this.originalFamily = this.family;
    if (this.version) {
      this.family += `-${this.version}`;
    }
    this.style =
      (names.preferredSubfamily && names.preferredSubfamily.en) || names.fontSubfamily.en;

    this.cssStyle = /(italic|oblique)/gi.test(this.style) ? "italic" : "normal";
    this.cssWeight = font.tables.os2.usWeightClass;
  }

  getFeatures() {
    const font = this.font;
    const names = font.names;
    const gpos = font.tables.gpos || {};
    const gsub = font.tables.gsub || {};

    const languageSet = new Set(
      [...(gpos.scripts || []), ...(gsub.scripts || [])]
        .flatMap(s => s.script.langSysRecords).map(lsr => lsr.tag)
    );
    const loclLanguages = Array.from(languageSet)
      .map(tag => {
        function compareTags(a, b) {
          if (a && b) {
            return a.padEnd(4, " ") === b.padEnd(4, " ");
          }
          else return false;
        }
        const language = opentypeLanguageTags.find(l => compareTags(l.tag, tag));
        const name = language ? language.name : tag;
        const htmlTag = findHtmlTag({ language: name });

        return ({ tag, name, htmlTag });
      })
      .sort((a, b) => a.name > b.name);

    const stylisticSetNames = Object.getOwnPropertyNames(names)
      .filter(p => /\d+/.test(p))
      .map(p => names[p].en);
    let i = 0;
    const getStylisticSetName = function () {
      return stylisticSetNames[i++];
    };

    this.gposFeatures = [];
    (gpos.features || []).forEach(f => {
      const duplicate = this.gposFeatures.find(ff => ff.tag == f.tag);
      if (!duplicate) {
        const feature = {
          tag: f.tag,
          name: findFeatureName(f.tag),
        };
        this.gposFeatures.push(feature);
      }
    });

    this.gsubFeatures = [];
    (gsub.features || []).forEach(f => {
      const duplicate = this.gsubFeatures.find(ff => ff.tag == f.tag);
      if (!duplicate) {
        const feature = {
          tag: f.tag,
          name: findFeatureName(f.tag),
        };

        if (f.tag == "locl") {
          feature.languages = loclLanguages;
          feature.selectedLanguage = "";
        } else if (/ss\d\d/.test(f.tag)) {
          feature.friendlyName = getStylisticSetName();
        }
        this.gsubFeatures.push(feature);
      }
    });

    this.variationAxes = (font && font.tables.fvar && font.tables.fvar.axes) || [];
  }

  generateFontFace() {
    this.fontFace = `
      @font-face {
        font-family: "${this.family}";
        font-style: ${this.cssStyle};
        font-weight: ${this.cssWeight};
        src: url('${this.url}');
      }
    `;
  }

  bumpVersion(value) {
    if (value) {
      this.version = value;
    }
    else {
      this.version++;
    }
    this.processFont();
  }
}
