/** @module utils/string */

/**
 * Capitalize the first letter of a string
 * @param {string} str - A string that we want to capitalize the first letter for
 * @returns {string}
 */
exports.capitalizeFirstLetter = (str) => {
  if (!str.length) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
