export const removeWhiteSpaces = (word: string) => {
  return word.replace(/\s/g, "");
};

export function isLetter(str: string) {
  return str.length === 1 && str.match(/[a-z]/i);
}
