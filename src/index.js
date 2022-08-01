const fs = require('fs/promises');
const pMap = require('p-map');
const path = require('path');
const glob = require('glob');
const gitIgnoreToGlob = require('gitignore-to-glob');
const { promisify } = require('util');

const { updateFilesPaths } = require('./rename-paths');
const { updateFileImports } = require('./update-file-imports');
const {
  startUpdatingImports,
  completeUpdatingImports,
} = require('./spinner');


/**
 *
 * @param {string} dir
 * @returns {Promise<string[]>} paths of files and directories
 */
async function getFilesAndDirsRecursively(dir) {
  const ignorePatterns = gitIgnoreToGlob(path.join(dir, '.gitignore')).map((pattern) => pattern.replace('!', ''));

  const paths = await promisify(glob)('**/*', {
    cwd: dir,
    ignore: ignorePatterns,
    nodir: false,
    absolute: true,
    nosort: false,
  });

  // Reversing the paths to get the files before the directories
  return paths.reverse();
}


async function run(cwd) {
  const fileAndDirPaths = await getFilesAndDirsRecursively(cwd);

  /**
   * @type {{path: string, type: 'file' | 'directory' | 'unknown'}[]}
   */
  const pathsTypes = (await pMap(fileAndDirPaths, async (fileOrDirPath) => {
    const stat = await fs.lstat(fileOrDirPath);
    return {
      path: fileOrDirPath,
      type: stat.isFile() ? 'file' : stat.isDirectory() ? 'directory' : 'unknown',
    }
  }, { concurrency: 10 }));

  const filesPaths = pathsTypes.filter(({ type }) => type === 'file').map(({ path }) => path);

  startUpdatingImports();
  await pMap(filesPaths, async (filePath) => await updateFileImports(filePath), { concurrency: 5 });
  completeUpdatingImports()


  const pathsToRename = pathsTypes.filter(({ path: fileOrDirPath, type }) => {
    return type === 'directory' || (type === 'file' && fileOrDirPath.endsWith('.ts'));
  }).map(({ path }) => path);
  await updateFilesPaths(pathsToRename, cwd);
}

const tsRepoPath = process.argv[2];

run(tsRepoPath)
  .catch((error) => {
    console.error('Failed to migrate', error);
  })
