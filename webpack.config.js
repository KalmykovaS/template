const path = require('path');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const SpritePlugin = require('svg-sprite-loader/plugin');
const ImageminWebpWebpackPlugin= require('imagemin-webp-webpack-plugin');

const { pages } = require('./webpack-helpers/HtmlFabric.js');

const htmlFabric = (object, pages) => {
    const totalPages = []

    for (let page of pages) {
        totalPages.push(new object({
            template: path.resolve(__dirname, page.template),
            filename: page.filename,
            minify: false,
            inject: 'body',
        }))
    }

    return totalPages
}

module.exports = {
    target: 'web',
    mode: 'development',
    devtool: 'source-map',
    stats: {
        children: true,
    },
    resolve: {
        alias: {
            util: require.resolve('util/'),
        },
    },
    watchOptions: {
        ignored: '**/node_modules',
    },
    entry: {
        index: ['@babel/polyfill', '/src/app/index.js'],
        sprite: glob.sync(path.resolve(__dirname, './src/static/img/svg/*.svg')),
    },
    output: {
        filename: 'script/[name].js',
        path: path.resolve(__dirname,'dist/'),
    },
    plugins: [
        new CleanWebpackPlugin(),
        new SpritePlugin(),
        new MiniCssExtractPlugin({
            filename: 'css/[name].css'
        }),
        new CopyPlugin({
            patterns: [
                { from: path.resolve(__dirname, './src/static/fonts'), to: path.resolve(__dirname, 'dist/fonts')},
                { from: path.resolve(__dirname, './src/static/img'), to: path.resolve(__dirname, 'dist/img')}
            ],
        }),
        ...htmlFabric(HtmlWebpackPlugin, pages),
        new ImageminWebpWebpackPlugin({
            config: [{
                test: /\.(jpe?g|png)/,
                options: {
                    quality: 90,
                }
            }],
        }),
    ],
    module:{
        rules: [
            {
                test: /\.s[ac]ss|css$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader
                    },
                    {
                        loader: 'css-loader',
                        options:{
                            url: false,

                        }
                    },
                    {
                        loader: 'postcss-loader'
                    },
                    {
                        loader: 'sass-loader',
                        options: {
                            sourceMap: true,
                        }
                    }
                ]
            },
            {
                test: /\.(png|jpg|gif|webp)$/,
                use:[
                    {
                        loader: 'file-loader',
                        options: {
                            name: 'img/[name].[ext]',
                        },
                    },
                ]
            },
            {
                test: /\.svg$/,
                loader: 'svg-sprite-loader',
                include: path.resolve(__dirname, './src/static/img/svg'),
                options: {
                    extract: true,
                    spriteFilename: 'img/svg/sprite.svg'
                },
            },
            {
                test: /\.(svg)$/,
                use:[{
                    loader: 'svgo-loader',
                }]
            },
            {
                test: /\.m?js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            ['@babel/preset-env', { targets: 'defaults' }]
                        ]
                    }
                }
            },
        ]
    },
    devServer: {
        port: 5000,
        static: {
            directory: path.join(__dirname, 'src'),
            watch: true
        },
    },
}