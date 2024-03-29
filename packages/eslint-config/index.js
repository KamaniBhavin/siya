module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  plugins: ['@typescript-eslint'],
  parser: '@typescript-eslint/parser',
  overrides: [],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE', "PascalCase"],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
      {
        selector: ['enum', 'enumMember'],
        format: ['PascalCase'],
      },
      {
        selector: 'parameter',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'memberLike',
        modifiers: ['private', 'protected'],
        format: ['camelCase'],
        leadingUnderscore: 'require',
      },
      {
        selector: 'memberLike',
        modifiers: ['public', 'static'],
        format: ['camelCase'],
        leadingUnderscore: 'forbid',
      },
      {
        selector: ['typeProperty', 'typeParameter'],
        format: ['camelCase', "UPPER_CASE", "PascalCase", "snake_case"],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'interface',
        format: ['PascalCase'],
        custom: {
          regex: '^I[A-Z]',
          match: true,
        },
      },
      {
        selector: ['class', 'function'],
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'typeAlias',
        format: ['PascalCase'],
      },
      {
        selector: 'method',
        format: ['camelCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: ['accessor', 'property'],
        format: ['camelCase', 'PascalCase', "snake_case"],
        leadingUnderscore: 'allow',
      },
      { // To maintain consistent naming convention for schema for zod.
        selector: 'variable',
        format: ['PascalCase'],
        filter: {
          regex: 'Schema$',
          match: true,
        }
      }
    ],
  },
};
