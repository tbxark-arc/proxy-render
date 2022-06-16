module.exports = {
  'ignorePatterns': [
    '**/dist/**',
  ],
  'env': {
    'es2021': true,
    'node': true,
  },
  'extends': [
    'google',
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  'rules': {
    'require-jsdoc': 'off',
    'max-len': 'warn',
    'no-tabs': 'warn',
  },
};
