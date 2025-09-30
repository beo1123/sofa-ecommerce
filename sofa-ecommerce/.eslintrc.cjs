module.exports = {
    root: true,
    env: { browser: true, node: true, es2022: true },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: ['./tsconfig.json']
    },
    plugins: ['@typescript-eslint', 'react-hooks', 'unused-imports'],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'next/core-web-vitals',
        'plugin:react-hooks/recommended',
        'plugin:prettier/recommended'
    ],
    rules: {
        'no-console': 'warn',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'unused-imports/no-unused-imports': 'warn',
        'prettier/prettier': ['error']
    },
    settings: { react: { version: 'detect' } }
};
