const fs = require('fs/promises');
const ts = require('typescript');
const { replaceStringInRange } = require('./utils');
const { updatePath } = require('./change-case');
const { incrementUpdateImports } = require('./spinner');

/**
 * @typedef { import("typescript").Expression } Expression
 */

/**
 *
 * @param {string} filePath
 * @return {Promise<string | undefined>} the updated file content
 */
async function updateFileImports(filePath) {
  // 1. Check if path end with '.ts'
  if (!filePath.endsWith(".ts")) {
    return undefined;
  }

  // 2. Read file
  const file = await fs.readFile(filePath, "utf8");

  // 3. Get AST of file
  const sourceFile = await ts.createSourceFile(
    filePath,
    file,
    ts.ScriptTarget.Latest,
    true,
  );


  /**
   * @type {Expression[]}
   */
  const inProjectImportModuleSpecifiers = sourceFile.statements
    // 4. Get all imports
    .filter(({ kind }) => kind === ts.SyntaxKind.ImportDeclaration)

    .map((dec) => dec.moduleSpecifier)

    // 5. For each import, check if it is a relative path
    // Not support absolute imports
    .filter(({ text }) => text.startsWith('.'))


    // No need to clone the array as we generated a new one
    // We reverse the array because we need to update the imports from the end of the file
    // because if not, we will update the first import and then the next import could be in a different position
    .reverse();

  let updatedFileContent = file;

  // 6. If it is, for each part of the path update the case
  inProjectImportModuleSpecifiers.forEach((moduleSpecifier) => {
    // For `import { TimeTrigger } from './time_trigger';`
    // pos here is 27 (the space right after `import { TimeTrigger } from`)
    // text here is `./time_trigger` (without the quotes)
    // getFullText here is ` './time_trigger'` (including the space + quotes)

    // Not using path separator based on OS as the paths are seperated by `/` even on Windows
    const updatedPath = updatePath(moduleSpecifier.text, '/');

    if (moduleSpecifier.text === updatedPath) {
      return;
    }

    const fullText = moduleSpecifier.getFullText();

    // Calculating the starting position ourselves as the `moduleSpecifier.pos` is point to the starting space
    const actualStartingIndex = moduleSpecifier.pos + fullText.indexOf(moduleSpecifier.text);

    // Not using end as it's not really the end (it can point to the semicolon)
    const actualEndingIndex = actualStartingIndex + moduleSpecifier.text.length;

    updatedFileContent = replaceStringInRange(updatedFileContent, actualStartingIndex, actualEndingIndex, updatedPath);
  });

  if(updatedFileContent === file) {
    return updatedFileContent;
  }

  incrementUpdateImports();

  // 8. Write back to file
  await fs.writeFile(filePath, updatedFileContent);

  return updatedFileContent;
}

module.exports = { updateFileImports };
