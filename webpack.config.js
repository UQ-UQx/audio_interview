var webpack = require("webpack");
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');

module.exports = {
    entry: {
      bundle: './src/index.js',
    },
    output: {
      filename: '[name].js',
      path: __dirname + '/public/dist'
    },
    plugins:[
      new ProgressBarPlugin(),
    
      // Automatically load modules instead of having to import or require them everywhere.
      new webpack.ProvidePlugin({
        //jQuery : 'jquery',
        //$ : 'jquery',
        //jquery : 'jquery',
        _ : 'lodash'
      }),

      new BrowserSyncPlugin({
        host: 'localhost',
        port: 3000,
        proxy: 'http://localhost:80/',
        files: [
          './public/**/*'
        ]
      })

    ],
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.(css|scss)$/,
          use:[
            { loader: 'style-loader' },
            {
              loader: 'css-loader',
              options: {
                modules: true
              }
            },
            { loader: 'sass-loader' }
          ]
        },
        {
          test: /\.(png|jpg|gif)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]',
                publicPath: 'assets/'
              }
            }
          ]
        }
      ]
    }
};