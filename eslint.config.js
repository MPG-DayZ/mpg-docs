// eslint.config.js

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { includeIgnoreFile } from '@eslint/compat';
import letu from '@webui/eslint-config-letu';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default [
  // Подхватываем гитигнор
  includeIgnoreFile(gitignorePath),

  // Добавляем конфиг letu
  ...letu,
];
