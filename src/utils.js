/**
 *
 * @param {string} str
 * @param {number} start
 * @param {number} end
 * @param {string} substitute
 * @return {string}
 */
function replaceStringInRange(str, start, end, substitute) {
  return str.substring(0, start) + substitute + str.substring(end);
}


module.exports = {
  replaceStringInRange
}
