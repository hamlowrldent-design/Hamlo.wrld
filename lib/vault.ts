export const VAULT = {
  // rotates quarterly (you can change this string each quarter)
  accessCode: "FROSTY",
};

export function currentQuarterId(date = new Date()) {
  const q = Math.floor(date.getMonth() / 3) + 1;
  return `${date.getFullYear()}-Q${q}`;
}
