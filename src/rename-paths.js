const path = require('path');
const { updatePath } = require('./change-case');
const simpleGit = require('simple-git');
const { startRenamingPaths, completeRenamingPaths, incrementPathsRenamed } = require('./spinner');


/**
 * @type {string}
 */
let gitCwd;
/**
 * @type {simpleGit.SimpleGit}
 */
let git;

async function mvFileInGit(cwd, from, to) {
  if (!git) {
    git = simpleGit({ baseDir: cwd });
    gitCwd = cwd;
  }
  if(gitCwd !== cwd) {
    await git.cwd(cwd);
    gitCwd = cwd;
  }

  await git.mv(from, to);
}

async function updateFilesPaths(files, cwd) {
  startRenamingPaths();

  let movedFiles = new Set();

  for (const filePath of files) {
    const relevantFilePath = path.relative(cwd, filePath)
    // Updating only last part as we update the folder as well later
    const updatedFilePath = updatePath(relevantFilePath, undefined, true)
    if(updatedFilePath === relevantFilePath) {
      continue;
    }

    if(movedFiles.has(relevantFilePath)) {
      console.warn('File already moved', relevantFilePath);
      continue;
    }

    movedFiles.add(updatedFilePath);

    await mvFileInGit(cwd, relevantFilePath, updatedFilePath);
    await incrementPathsRenamed();
  }
  completeRenamingPaths();
}

module.exports = { updateFilesPaths };
