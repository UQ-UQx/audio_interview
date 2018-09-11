var webpack = require("webpack");
var BrowserSyncPlugin = require('browser-sync-webpack-plugin');
var ProgressBarPlugin = require('progress-bar-webpack-plugin');
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;




var figlet = require('figlet');
var chalk = require('chalk');

function showMessage(chalkMessage){

  figlet('UQx  /  UQ2U', function(err, data) {
      if (err) {
          console.log('UQx  /  UQ2U');
          return;
      }
      console.log(data)
      console.log(chalk.blue(chalkMessage+' - UQx/CDD Learning Tools Team'));
  
  });
}

module.exports = (env, argv) => {

  var plugins = [
    new ProgressBarPlugin(),

    // Automatically load modules instead of having to import or require them everywhere.
    new webpack.ProvidePlugin({
      //jQuery : 'jquery',
      //$ : 'jquery',
      //jquery : 'jquery',
      //_ : 'lodash'
    }),

 

    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      proxy: 'http://localhost:80/',
      files: [
        // './public/**/*'
        './public/dist/*', 
        './public/index.php', 
        './public/api/*.php', 
        './public/lib/*.php',
      ]
    })

  ]

  var chalkMessage = 'Happy Coding! 😄';
  if(argv.mode === "production") chalkMessage = "🎉  Woo! ready for production 🎉 "
 
  if(argv.mode === "development") plugins.push(new BundleAnalyzerPlugin());


    showMessage(chalkMessage);



return {  
    entry: {
      bundle: './src/index.js',
    },
    output: {
      filename: '[name].js',
      path: __dirname + '/public/dist'
    },
    plugins:plugins,
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
        },
        {
          test: /\.(svg|woff|woff2|eot|ttf|otf)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                name: 'fonts/[name].[ext]',
              }
            }
          ]
        }
      ]
    }
}
};
