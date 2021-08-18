var webpack = require('webpack');
var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = function (options) {
    return {
        entry: {
            index: './app/index.js'
        }
        ,
        devtool: 'inline-source-map',
        output: {
            filename: '[name]_editor_admin.js',
            path: path.resolve(__dirname, 'app'),

        },
        plugins: [

            new webpack.DefinePlugin({
                'EDITOR_ENV': {
                    user: false,
                    admin: true,
                    companyID: 25,
                    port: options[0] || 1351,
                    domain: JSON.stringify(options[1] || 'https://digitalprint.pro'),
                    frameworkUrl: JSON.stringify(options[2] || 'https://api.digitalprint.pro'),
                    authUrl: JSON.stringify(options[3] || 'https://digitalprint.pro:2600'),
                    staticUrl: JSON.stringify(options[4] || 'https://digitalprint.pro:1341')
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
                        presets: ['react', 'es2016', 'stage-0']
                    }
                }

            ]

        },
        devServer: {
            hot: true
        }

    }
};
