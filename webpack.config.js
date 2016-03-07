var webpack = require('webpack');

module.exports = {
    entry: './src/app.js',
    output: {
        path: __dirname,
        filename: 'bundle.js'
    },
    externals: {
        'jquery': 'jQuery',
        'fs': '{}'
    },
    module: {
        loaders: [
            { test: /\.js?$/, exclude: /node_modules/, loader: 'babel-loader'},
            { test: /\.(frag|vert)$/, exclude: /node_modules/, loader: 'raw' },
            { test: /\.jade$/, exclude: /node_modules/, loader: 'jade' },
        ]
    }
}