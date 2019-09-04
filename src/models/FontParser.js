import Font from "@/models/Font";

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
