import * as path from 'path';

type Dictionary<T> = {[key: string]: T};
type FileContentDict = Dictionary<string>;
type DirectoryListing = Dictionary<string[]>;

const fs: any = jest.genMockFromModule('fs');

let mockFiles: DirectoryListing = {};
let allMockFiles: FileContentDict = {};
function __setMockFiles(newMockFiles: FileContentDict) {
  mockFiles = Object.create(null);
  for (const file in newMockFiles) {
    allMockFiles[file] = newMockFiles[file];
    const dir = path.dirname(file);

    if (!mockFiles[dir]) {
      mockFiles[dir] = [];
    }
    mockFiles[dir].push(path.basename(file));
  }
}

function readdirSync(directoryPath: string): string[] {
  if (mockFiles[directoryPath]) {
    return mockFiles[directoryPath];
  }
  return [];
}

function readFileSync(filePath: string): string {
  if (allMockFiles[filePath]) {
    return allMockFiles[filePath];
  }
  return '';
}

function existsSync(filePath: string): boolean {
  return (typeof allMockFiles[filePath] !== 'undefined');
}

fs.__setMockFiles = __setMockFiles;
fs.readFileSync = readFileSync;
fs.readdirSync = readdirSync;
fs.existsSync = existsSync;

module.exports = fs;