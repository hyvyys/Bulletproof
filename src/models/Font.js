import opentypeLanguageTags from "./opentypeLanguageTags";
import { getOpenTypeFeatureName } from "./opentypeFeatureNames";

export default class Font {
  constructor(font, url, fileName) {
    this.version = 0;
    this.url = url;
    this.fileName = fileName;
    this.font = font;
    this.processFont();
  }

  serialize() {
    // eslint-disable-next-line no-unused-vars
    const { font, ...obj } = this;
    return obj;
  }

  processFont() {
    this.getNames();
    this.getFeatures();
    this.getGlyphs();
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

    this.cssFamily = this.family + '-' + this.style;
    this.cssStyle = /(italic|oblique)/gi.test(this.style) ? "italic" : "normal";
    this.cssWeight = font.tables.os2.usWeightClass;

    this.displayName = `${this.originalFamily} ${this.style} ${this.version ? `(${this.version})` : ''}`;
  }

  getGlyphs() {
    const font = this.font;
    // this.characters = Object.keys(font.tables.cmap.glyphIndexMap).map(unicode => String.fromCharCode(unicode));
    const glyphs = Object.keys(font.glyphs.glyphs)
      .map(k => font.glyphs.glyphs[k])
      .filter(g => g.unicode)
      .map(g => String.fromCharCode(g.unicode));
    this.characters = glyphs;
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
      // tags are four characters, last most commonly space
        const language = opentypeLanguageTags.find(l => l.opentypeTag === tag);
        const name = language ? language.name : tag;
        const htmlTag = language ? language.htmlTag : tag.toLowerCase();
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
          name: getOpenTypeFeatureName(f.tag),
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
          name: getOpenTypeFeatureName(f.tag),
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

    this.variationAxes = [];
    if (font && font.tables.fvar && font.tables.fvar.axes) {
      this.variationAxes = font && font.tables.fvar && font.tables.fvar.axes;
    }
  }

  generateFontFace({ family, style, weight } = {}) {
    this.fontFace = `
      @font-face {
        font-family: "${family || this.cssFamily}";
        font-style: ${style || this.cssStyle};
        font-weight: ${weight || this.cssWeight};
        src: url('${this.url}');
      }
    `;
    return this.fontFace;
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
