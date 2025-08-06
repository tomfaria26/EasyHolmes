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
  }
}) 