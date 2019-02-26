const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

module.exports = {
    entry: {
        app: './src/index.js'
    },
    plugins: [
        // new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            template: './src/html/index.html',
            filename:'index.html',
        }),
        new webpack.HashedModuleIdsPlugin(),
    ],
    output:{
        filename:'[name].[contenthash].js',
        chunkFilename: '[name].[contenthash].js',
        //注意：启动webpack-dev-server后，在目标文件夹中是看不到编译后的文件的,实时编译后的文件都保存到了内存当中
        path:path.resolve(__dirname,'./dist')
    },
    optimization: {
        runtimeChunk: 'single',
        splitChunks: {
            cacheGroups: {
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendors',
                    chunks: 'all'
                }
            }            
        }
    },
    module:{ 
        rules:[
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                },
                exclude: '/node_modules/'
            }
        ]
    },
    resolve:{
        extensions:['.tsx','.ts','.js']
    }
        
}