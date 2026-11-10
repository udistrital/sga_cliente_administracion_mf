const singleSpaAngularWebpack = require('single-spa-angular/lib/webpack').default;

module.exports = (config, options) => {
  const singleSpaWebpackConfig = singleSpaAngularWebpack(config, options);

  // Angular ya genera los source maps con SourceMapDevToolPlugin; si single-spa-angular
  // también activa `devtool`, ambos emiten main.js.map y webpack falla por conflicto.
  const angularSourceMaps = singleSpaWebpackConfig.plugins.some(
    (plugin) => plugin.constructor.name === 'SourceMapDevToolPlugin'
  );
  if (angularSourceMaps) {
    singleSpaWebpackConfig.devtool = false;
  }

  // single-spa-angular 21 ya no agrega este header; sin él el root (4200) no puede cargar main.js
  singleSpaWebpackConfig.devServer = singleSpaWebpackConfig.devServer || {};
  singleSpaWebpackConfig.devServer.headers = {
    ...singleSpaWebpackConfig.devServer.headers,
    'Access-Control-Allow-Origin': '*',
  };

  // Feel free to modify this webpack config however you'd like to
  return singleSpaWebpackConfig;
};
