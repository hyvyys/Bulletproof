module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ["plugin:vue/essential", "eslint:recommended"],
  rules: {
    "comma-dangle": ["error", "always-multiline"],
    "no-dupe-keys": ["off"],
    "no-console": ["off"],
    "no-extra-semi": ["off"],
    "no-unused-vars": ["off"],
    "no-irregular-whitespace": ["off"],
  },
  parserOptions: {
    parser: "babel-eslint"
  },
  overrides: [
    {
      files: ["**/__tests__/*.{j,t}s?(x)"],
      env: {
        jest: true
      }
    }
  ]
};
