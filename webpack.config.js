var webpack  = require('webpack');
var path     = require('path');

module.exports = {
    entry: [
      // 'webpack-dev-server/client?http://localhost:1243',
      // 'webpack/hot/only-dev-server',
      './src/js/index.js'
    ],

    devtool: 'source-map',

    module: {
    	loaders: [
	    	{
	    		test: /\.js$/,
	    		exclude: /node_modules/,
                include: path.join(__dirname, 'src'),
	    		loader: 'babel-loader', 
	    		query: {
	    			presets: ['es2015', 'react']//, 'react-hmre']
	    		}
	    	},
	    	{
                test: /\.css$/,
                exclude: /node_modules/,
                loader: 'style!css'
            },
            {
                test: /\.scss$/,
                loaders: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.(png|jpg)$/,
                loader: 'url-loader?limit=1000000'
            }
    	]
    },

    output: {
        filename: './public/bundle.js'
    },

    plugins: [
        // new webpack.HotModuleReplacementPlugin(),
    ],

    watch: true

};