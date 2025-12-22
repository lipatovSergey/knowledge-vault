import { normalizeSearchString } from "../search-string-normalize.util";

describe("normalizeSearchString", () => {
  it("plain text unchanged", () => {
    const plainText = "hello world";
    const result = normalizeSearchString(plainText);
    expect(result).toBe(plainText);
  });

  it.each(["\\", ".", "^", "$", "*", "+", "?", "(", ")", "[", "]", "{", "}", "|", "/"])(
    "escapes regex metacheracter %s",
    (input) => {
      const result = normalizeSearchString(input);
      expect(result).toBe(`\\${input}`);
    },
  );

  it("mixed string", () => {
    const result = normalizeSearchString("a.b?c");
    expect(result).toBe("a\\.b\\?c");
  });

  it("saves white spaces", () => {
    const textWithWhiteSpaces = "  some text  ";
    const result = normalizeSearchString(textWithWhiteSpaces);
    expect(result).toBe(textWithWhiteSpaces);
  });

  it("empty string stays empty", () => {
    const emptyString = "";
    const result = normalizeSearchString(emptyString);
    expect(result).toBe(emptyString);
  });

  it("escapes a sequence of regex metacheracter", () => {
    const allMetaCharacters = "\\.^$*+?()[]{}|/";
    const expectedResult = "\\\\\\.\\^\\$\\*\\+\\?\\(\\)\\[\\]\\{\\}\\|\\/";
    const result = normalizeSearchString(allMetaCharacters);
    expect(result).toBe(expectedResult);
  });
});
