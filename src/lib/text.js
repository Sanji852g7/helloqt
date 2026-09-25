// Capitalizes the first letter of each word in a name, so "sanji gurung" or
// "SANJI" both become "Sanji Gurung" - also handles hyphenated and
// apostrophe'd names like "mary-jane" and "o'brien"
export function toTitleCase(value) {
  return value.toLowerCase().replace(/(^|[\s'-])([a-z])/g, (_, sep, char) => sep + char.toUpperCase())
}
