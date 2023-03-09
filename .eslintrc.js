module.exports = {
  extends: '@callstack/eslint-config',
  rules: {
    "require-await": "error"
  },
  ignorePatterns: ["docusaurus/**", "**/lib/**/*", "examples/web-nextjs"]
};
