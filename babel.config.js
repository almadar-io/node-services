let config = {
  "presets": ["@babel/preset-env"],
}
const webpackConfig = function (api) {
  api.cache(true);
  const presets = config.presets;
  const plugins = config.plugins;
  return {
    ignore: [/node_modules\/(?!orbital-node-services)/],
    presets,
    plugins
  };
}

export default webpackConfig;