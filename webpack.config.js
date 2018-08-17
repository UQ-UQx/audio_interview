module.exports = {
    entry: {
        bundle: './src/index.js',
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/public/dist'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        }
      ]
    }
};