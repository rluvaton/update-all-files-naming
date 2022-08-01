const ora = require('ora');

/**
 * @type {Ora}
 */
let updateImportsSpinner;

/**
 * @type {Ora}
 */
let renamePathsSpinner;


let numberOfFilesThatNeedImportUpdate = 0;
let numberOfRenamedPaths = 0;

function startUpdatingImports() {
  updateImportsSpinner = ora('Updating imports in files').start();
}

function incrementUpdateImports() {
  updateImportsSpinner.text = `Update imports in ${++numberOfFilesThatNeedImportUpdate} files`;
}
function completeUpdatingImports() {
  updateImportsSpinner.succeed(`Finish updating imports, updated ${numberOfFilesThatNeedImportUpdate} files`);
}

function startRenamingPaths() {
  renamePathsSpinner = ora('Renaming files / directory paths').start();
}

function incrementPathsRenamed() {
  numberOfRenamedPaths++;
  renamePathsSpinner.text = `Renamed ${++numberOfFilesThatNeedImportUpdate} files and directories`;
}

function completeRenamingPaths() {
  renamePathsSpinner.succeed(`Complete renaming paths, ${numberOfFilesThatNeedImportUpdate} paths renamed`);
}

module.exports = {
  startUpdatingImports,
  incrementUpdateImports,
  completeUpdatingImports,

  startRenamingPaths,
  incrementPathsRenamed,
  completeRenamingPaths,
}
