/** 
 * Special characters that need to be escaped in Telegram messages with Markdown mode (v1)
 * 
 * https://core.telegram.org/bots/api#markdown-style
 */
const SPECIAL_CHARS = [
  '_',
  '*',
  '`',
  '[',
];

/**
 * Escapes special characters in a string
 */
export function escapeSpecialChars(inputString: string): string {
  let newString = inputString;

  SPECIAL_CHARS.forEach(char => (newString = newString.replaceAll(char, `\\${char}`)))

  return newString
}