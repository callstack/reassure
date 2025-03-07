module.exports = {
  presets: [['@babel/preset-env', { targets: { node: 'current' } }], '@babel/preset-react', '@babel/preset-typescript'],
  plugins: ['@babel/plugin-transform-flow-strip-types'],
  env: {
    test: {
      presets: ['@react-native/babel-preset'],
    },
  },
};
