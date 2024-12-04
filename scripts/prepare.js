import { access, constants, writeFile } from 'node:fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const npmRcContent = `registry=https://art.letoile.tech/artifactory/api/npm/npm/`;

/**
 * @returns {boolean}
 */
const checkFile = async (fileName) => {
  try {
    await access(join(__dirname, fileName), constants.R_OK);

    return true;
  } catch {
    return false;
  }
};

const createFile = async (fileName, content) => {
  try {
    await writeFile(join(__dirname, fileName), content);
    // eslint-disable-next-line no-console
    console.log(`
  ┌──────────────────────┐
  |   .npmrc created     |
  └──────────────────────┘
  `);
  } catch {
    console.error(`${fileName} file is not created`);
    // eslint-disable-next-line no-console
    console.info(`You must create ${fileName} manually with content:`);
    // eslint-disable-next-line no-console
    console.info(content);
  }
};

const run = async () => {
  const hasNpmRc = await checkFile('../.npmrc');

  if (!hasNpmRc) {
    await createFile('../.npmrc', npmRcContent);
  }
};

run().then(() => {
  // eslint-disable-next-line no-console
  console.log(`
  ┌───────────────────────────────┐
  |  Now run:                     |
  |   1) npm ci                   |
  |   2) npm run work             |
  └───────────────────────────────┘
  `);
});
