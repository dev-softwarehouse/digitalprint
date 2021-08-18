var webpack = require('webpack');
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = function (options) {
    return {
        entry: {
            index: './app/index.js'
        },

        devtool: 'inline-source-map',
        output: {
            filename: '[name]_editor_user.js',
            path: path.resolve(__dirname, 'app'),

        },
        plugins: [

            new webpack.DefinePlugin({
                'EDITOR_ENV': {
                    user: true,
                    admin: false,
                    companyID: 25,
                    port: options[0] || 1351,
                    domain: JSON.stringify(options[1] || 'http://dreamsoft1.pro'),
                    frameworkUrl: JSON.stringify(options[2] || 'http://api.digitalprint.pro'),
                    authUrl: JSON.stringify(options[3] || 'http://logowanie1.dreamsoft.pro'),
                    staticUrl: JSON.stringify(options[4] || 'http://static1.dreamsoft.pro'),
                }
            }),
            new HtmlWebpackPlugin({
                chunks: ['index'],
                filename: 'index.html',
                template: 'index.html'
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
