export const removeWhiteSpaces = (word: string) => {
  return word.replace(/\s/g, "");
};

// export const getRandomInt = (max: number) => {
//   return Math.floor(Math.random() * max);
// };
export function isLetter(str: string) {
  return str.length === 1 && str.match(/[a-z]/i);
}
