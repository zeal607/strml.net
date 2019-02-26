'use strict';
var webpack = require('webpack');
var path = require('path');

// Builds bundle usable inside <script>.
module.exports = {
  context: __dirname,
  entry: {
    'app': './app.js'
  },
  output: {
    path: path.join(__dirname, "/dist"),
    filename: "[name].js",
    libraryTarget: "umd",
    library: "app",
  },
  devtool: 'source-map',
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      }
    ]
  },
  devServer: {
    contentBase: __dirname,
    publicPath: '/dist',
    compress: true,
    port: 4003,
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin()
  ],
  //webpack 4之后一般是通过指定mode来自动优化，但也支持如下的手动配置来覆盖默认优化
  // optimization:{
  //   minimize: false
  // },
  //允许通过提供一个或多个自定义TerserPlugin实例来覆盖默认的minimzer
  //optimization: {
  //   minimizer: [
  //     new TerserPlugin({
  //       cache: true,
  //       parallel: true,
  //       sourceMap: true, // Must be set to true if using source-maps in production
  //       terserOptions: {
  //         // https://github.com/webpack-contrib/terser-webpack-plugin#terseroptions
  //       }
  //     }),
  //   ],
  // },
  resolve: {
  }
};
