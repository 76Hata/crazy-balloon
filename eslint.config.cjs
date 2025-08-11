const js = require('@eslint/js');
const html = require('eslint-plugin-html');

module.exports = [
  js.configs.recommended,
  {
    files: ['*.html'],
    plugins: {
      html: html
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        window: 'readonly',
        document: 'readonly',
        console: 'readonly',
        performance: 'readonly',
        requestAnimationFrame: 'readonly',
        setTimeout: 'readonly',
        localStorage: 'readonly',
        Math: 'readonly',
        Date: 'readonly'
      }
    },
    rules: {
      // Core JavaScript rules
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }], // Ignore unused args with underscore prefix
      'no-undef': 'error',
      'no-console': 'off', // Allow console for game debugging
      'prefer-const': 'warn',
      'no-var': 'error',
      
      // Code style - more relaxed for game code
      'indent': 'off', // Mixed indentation is common in HTML
      'quotes': 'off', // Allow both single and double quotes
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'never'],
      
      // Best practices - relaxed for game development
      'eqeqeq': 'warn',
      'curly': 'off', // Allow single-line if statements
      'no-eval': 'error',
      'no-implied-eval': 'error',
      
      // Game-specific allowances
      'no-magic-numbers': 'off', // Game physics often use magic numbers
      'max-lines-per-function': 'off', // Game loops can be long
      'complexity': 'off', // Game logic can be complex
      'no-multiple-empty-lines': 'off' // Allow multiple empty lines for readability
    }
  },
  {
    files: ['*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    }
  }
];