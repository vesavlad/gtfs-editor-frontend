// vue.config.js
module.exports = {
  runtimeCompiler: true,

  transpileDependencies: [
    'vue-echarts',
    'resize-detector'
  ],

  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  }
}
