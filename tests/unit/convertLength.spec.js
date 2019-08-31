import convertLength from "../../src/models/convertLength";


// function convertLength({ base = 16, decimals = 2, dpi = 72, from, to, value } = {}) {

describe("convertLength()", () => {

  const testCases = [
    { value: 12, from: "pt", to: "em", expected: "1em" },
  ];

  testCases.forEach(({ value, from, to, expected}) => {
    it("converts pt to em", () => {
      const a = convertLength({ value, from, to });
      expect(a).toBe(expected);
    });
  })

});
