var webpack = require('webpack');
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = function (options) {
    return {
        entry: {
            index: './demo/index.js'
        },

        devtool: 'inline-source-map',
        output: {
            filename: 'demo.js',
            path: path.resolve(__dirname, 'dist')
        },
        plugins: [

            new webpack.DefinePlugin({
                'EDITOR_ENV': {
                    user: true,
                    admin: false,
                    companyID: 25,
                    port: options[0] || 1351,
                    domain: JSON.stringify(options[1] || 'https://digitalprint.pro'),
                    frameworkUrl: JSON.stringify(options[2] || 'https://api.digitalprint.pro'),
                    authUrl: JSON.stringify(options[3] || 'https://digitalprint.pro:2600'),
                    staticUrl: JSON.stringify(options[4] || 'https://digitalprint.pro:1341'),
                }
            }),
            new HtmlWebpackPlugin({
                chunks: ['index'],
                filename: 'index.html',
                template: './demo.html'
            })
        ],

        module: {

            loaders: [

                {
                    test: /\.js$/,
                    loader: 'babel-loader',
                    query: {
                        compact: false,
                        presets: ['react', 'es2016', 'stage-0']/*,
                        plugins:[['transform-optional-chaining',{loose:true}]]*/
                    }
                }

            ]

        }
    }

};
