export default {
  plugins: ['commitlint-plugin-regex-match'],
  rules: {
    'body-match': [
      2,
      'always',
      '(?<JiraID>[A-Z0-9]{2,10}-\\d{2,10}:)(?<Eng_and_special_symbols_only>[A-Za-z\\d\\s\\n\\r!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~]+$)',
    ],
  },
};
