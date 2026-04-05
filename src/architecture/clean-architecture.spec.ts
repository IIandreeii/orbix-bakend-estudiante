import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const coreRoot = join(__dirname, '..', 'core');
const srcRoot = join(__dirname, '..');

const forbiddenPatterns = [
  /@nestjs\//,
  /@nestjs-modules\//,
  /\binterface\//,
  /\binfrastructure\//,
];

function collectFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, acc);
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      acc.push(fullPath);
    }
  }
  return acc;
}

function findOffenders(files: string[], patterns: RegExp[]): string[] {
  const offenders: string[] = [];
  for (const file of files) {
    const contents = readFileSync(file, 'utf8');
    if (patterns.some((pattern) => pattern.test(contents))) {
      offenders.push(file);
    }
  }
  return offenders;
}

describe('Clean Architecture boundaries', () => {
  it('core layer does not import frameworks or outer layers', () => {
    const files = collectFiles(coreRoot);
    const offenders = findOffenders(files, forbiddenPatterns);

    expect(offenders).toEqual([]);
  });

  it('source code does not use forwardRef cycles', () => {
    const files = collectFiles(srcRoot);
    const offenders = findOffenders(files, [/\bforwardRef\s*\(/]);

    expect(offenders).toEqual([]);
  });

  it('source code does not use console logging', () => {
    const files = collectFiles(srcRoot);
    const offenders = findOffenders(files, [/\bconsole\.(log|warn|error)\s*\(/]);

    expect(offenders).toEqual([]);
  });
});
