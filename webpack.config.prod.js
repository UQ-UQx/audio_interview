'use strict'
var webpack = require("webpack");

var webpackConfig = require('./webpack.config')


console.log(webpackConfig);


// modify the config for product if needed
module.exports = webpackConfig;