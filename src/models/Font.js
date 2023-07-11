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
    const names = font.names.windows;
    this.family = (names.preferredFamily && names.preferredFamily?.en) || names.fontFamily?.en || '';
    this.originalFamily = this.family;
    if (this.version) {
      this.family += `-${this.version}`;
    }
    this.style =
      (names.preferredSubfamily && names.preferredSubfamily.en) || names.fontSubfamily?.en || '';

    this.cssFamily = this.family + '-' + this.style;
    // this.cssStyle = /(italic|oblique)/gi.test(this.style) ? "italic" : "normal";
    this.cssStyle = /(italic|oblique)/gi.test(this.style) ? "oblique" : "normal";
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
    const names = font.names.windows;
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
    loclLanguages.unshift({ tag: '', htmlTag: '', name: 'automatic' });

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
          feature.selectedLanguage = loclLanguages[0];
        } else if (/ss\d\d/.test(f.tag)) {
          const uiName = names[f.feature.featureParamsTable.uiNameId];
          feature.uiName = uiName && uiName['en'];
        } else if (/cv\d\d/.test(f.tag)) {
          const uiName = names[f.feature.featureParamsTable.featUiLabelNameId];
          feature.uiName = uiName && uiName['en'];
        }
        this.gsubFeatures.push(feature);
      }
    });

    this.variationAxes = [];
    if (font && font.tables.fvar && font.tables.fvar.axes) {
      this.variationAxes = font && font.tables.fvar && font.tables.fvar.axes;
    }
    this.variationAxes.forEach(a => {
      a.step = (a.maxValue - a.minValue) > 10 ? 1 : .01;
      a.displayName = a.tag;
    })
  }

  // generateFontFace({ family, style, weight } = {}) {
  generateFontFace() {
    this.fontFace = `
      @font-face {
        src: url('${this.url}');
        font-family: "${this.cssFamily}";
        ${ this.variationAxes.length === 0 ? 'font-weight: bold' : ''};  // prevent fake bold, allow for automatic weight in Variable fonts
        font-weight: 0 1000;
        font-style: oblique 0deg 20deg;
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
