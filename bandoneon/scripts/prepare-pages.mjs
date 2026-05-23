import { access, copyFile, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distDir = resolve(rootDir, 'dist');
const indexFile = resolve(distDir, 'index.html');

await access(indexFile, constants.F_OK);
await copyFile(indexFile, resolve(distDir, '404.html'));
await writeFile(resolve(distDir, '.nojekyll'), '');