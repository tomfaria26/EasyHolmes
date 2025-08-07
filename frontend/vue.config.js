const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  lintOnSave: false, // Desabilitar ESLint temporariamente
  devServer: {
    host: '0.0.0.0',
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://backend:3000',
        changeOrigin: true
      }
    }
  },
  configureWebpack: {
    resolve: {
      fallback: {
        "fs": false,
        "path": false,
        "crypto": false
      }
    }
  },
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0].__VUE_PROD_HYDRATION_MISMATCH_DETAILS__ = 'false'
      args[0].__VUE_PROD_DEVTOOLS__ = 'false'
      return args
    })
    
    // Configurar o título da aplicação
    config.plugin('html').tap(args => {
      args[0].title = 'EasyHolmes'
      return args
    })
  }
}) 