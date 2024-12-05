import pluginJs from '@eslint/js';
import stylisticTs from '@stylistic/eslint-plugin';
import stylisticJs from '@stylistic/eslint-plugin';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const additionalGlobals = {
  /**
   * fix for false positive 'no-undef'
   * @see https://github.com/eslint/typescript-eslint-parser/issues/416 typescript-eslint-parser issue on github
   */
  CredentialRequestOptions: false,
};

export default [
  {
    name: 'js: recommended',
    ...pluginJs.configs.recommended,
  },
  {
    name: 'prettier: recommended',
    ...eslintPluginPrettierRecommended,
  },
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    name: 'pafnuty: global languageOptions',
    languageOptions: {
      globals: { ...globals.browser, ...additionalGlobals },
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
    },
  },
  {
    name: 'pafnuty: files pattern',
    files: ['**/*.{js,mjs,cjs,ts,vue}'],
  },
  {
    name: 'pafnuty: stylistic',
    plugins: {
      '@stylistic/js': stylisticJs,
      '@stylistic/ts': stylisticTs,
    },
    rules: {
      '@stylistic/js/semi': ['error', 'always'],
      '@stylistic/js/block-spacing': ['error', 'always'],
      '@stylistic/js/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/js/no-mixed-operators': 'error',
      '@stylistic/js/lines-around-comment': [
        'error',
        {
          beforeBlockComment: false,
          allowBlockStart: true,
          allowObjectStart: true,
          allowArrayStart: true,
        },
      ],
      '@stylistic/js/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: ['return', 'export', 'function'],
        },
        { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
        {
          blankLine: 'any',
          prev: ['const', 'let', 'var'],
          next: ['const', 'let', 'var'],
        },
      ],
    },
  },
  {
    name: 'pafnuty: typescript',
    rules: {
      '@typescript-eslint/ban-ts-comment': 'error',
    },
  },
  {
    name: 'pafnuty: global rules',
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'no-unexpected-multiline': 'error',
      'no-var': 'error',
      'no-unsafe-optional-chaining': 'error',
      'id-length': ['error', { min: 2, properties: 'never' }],
      curly: ['error', 'all'],
      'arrow-body-style': ['error', 'always'],
    },
  },
  {
    name: 'pafnuty: vue rules',
    rules: {
      'vue/require-default-prop': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-multiple-template-root': 'off',
      'vue/component-name-in-template-casing': [
        'error',
        'PascalCase',
        {
          registeredComponentsOnly: true,
        },
      ],
      'vue/padding-line-between-blocks': ['error', 'always'],
      'vue/attributes-order': [
        'error',
        {
          order: [
            'DEFINITION',
            'LIST_RENDERING',
            'CONDITIONALS',
            'GLOBAL',
            'OTHER_ATTR',
            'RENDER_MODIFIERS',
            ['UNIQUE', 'SLOT'],
            'TWO_WAY_BINDING',
            'OTHER_DIRECTIVES',
            'EVENTS',
            'CONTENT',
          ],
          alphabetical: false,
        },
      ],
      'vue/no-empty-component-block': 'error',
      'vue/block-order': [
        'error',
        {
          order: [['script:not([setup])', 'script[setup]'], 'template', ['style:not([scoped])', 'style[scoped]']],
        },
      ],
      'vue/v-bind-style': [
        'error',
        'shorthand',
        {
          sameNameShorthand: 'always',
        },
      ],
      'vue/prop-name-casing': ['error', 'camelCase'],
      'vue/custom-event-name-casing': ['error', 'camelCase'],
      'vue/attribute-hyphenation': ['error', 'never'],
      'vue/v-on-event-hyphenation': ['error', 'never'],
    },
  },
  {
    name: 'pafnuty: prettier',
    rules: {
      'prettier/prettier': [
        'error',
        // Конфиг prettier вынесен сюда т.к. плагин eslint не умеет нормально читать конфиг из prettier.config.js
        {
          // Взято из конфига prettier
          printWidth: 120,
          singleQuote: true,
          endOfLine: 'auto',

          // Prettier plugins
          plugins: [
            '@ianvs/prettier-plugin-sort-imports',
            /**
             * tailwind plugin должен всегда быть последним в списке
             * @see https://github.com/tailwindlabs/prettier-plugin-tailwindcss?tab=readme-ov-file#compatibility-with-other-prettier-plugins prettier-plugin-tailwindcss repo
             */
            'prettier-plugin-tailwindcss',
          ],
          // prettier-plugin-sort-imports options
          importOrder: [
            // Пустая строка в начале файла после комментария
            '',
            // стили
            '.(css|scss)$',
            '',
            // NodeJs модули
            '<BUILTIN_MODULES>',
            '',
            // Библиотеки
            '<THIRD_PARTY_MODULES>',
            '',
            // Общие компоненты
            '^(@/shared)',
            // Роуты
            '^(@routes)',
            // импорты из относительных путей
            '^[.]',
            '',
            // типы, порядок такой же как и обычные импорты
            '<TYPES>^(node:)',
            '<TYPES>',
            '<TYPES>^(@/shared)',
            '<TYPES>^(@routes)',
            '<TYPES>^[.]',
          ],
          importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
          importOrderTypeScriptVersion: '5.5.3',
        },
      ],
    },
  },
];
