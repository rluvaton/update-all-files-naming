const { paramCase } = require('change-case');
const path = require('path');

/**
 *
 * @param {string} path
 * @return {string}
 */
function updateCase(path) {
  return path
    .split(".")
    .map((part) => {
      if(part === '__fixtures__') {
        return part;
      }
      return paramCase(part);
    })
    .join(".");
}

function updatePath(filePath, separator = path.sep, onlyLastPart = false) {
  return filePath
    .split(separator)
    .map((part, index, parts) => {
      if(onlyLastPart && index !== parts.length - 1) {
        return part;
      }
      return updateCase(part);
    })
    .join(separator)
}

module.exports = { updateCase, updatePath };
