export function normalizeSearchString(string: string): string {
  const regexSymbols = ["\\", ".", "^", "$", "*", "+", "?", "(", ")", "[", "]", "{", "}", "|", "/"];
  let result = "";
  for (const char of string) {
    if (regexSymbols.includes(char)) {
      result += "\\" + char;
    } else {
      result += char;
    }
  }
  return result;
}
