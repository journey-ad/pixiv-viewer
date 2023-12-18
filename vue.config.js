const autoprefixer = require('autoprefixer');
const pxtorem = require('postcss-pxtorem');

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '././'
    : '/',
  pwa: {
    name: "pixiv-viewer",
    themeColor: "#2cabff"
  },
  chainWebpack: config => {
    config
      .module
      .rule('vue')
      .use('vue-loader')
      .tap(args => {
        args.compilerOptions.whitespace = 'preserve'
      })

    config
      .plugin('define')
      .tap(args => {
        args[0] = {
          ...args[0],
          __BUILD_TIMESTAMP__: JSON.stringify(Date.now() / 1000 | 0),
        }
        return args
      })
  },
  css: {
    loaderOptions: {
      postcss: {
        plugins: [
          autoprefixer(),
          pxtorem({
            rootValue: 75,
            propList: ['*'],
            selectorBlackList: ['van']
          })
        ]
      }
    },
    sourceMap: true
  },
  lintOnSave: false,
  runtimeCompiler: true,
}