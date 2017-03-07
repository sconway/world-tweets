// Configuration file for production builds.

var webpack           = require('webpack'),
    path              = require('path'),
    autoprefixer      = require('autoprefixer'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: './src/js/index.js',

  module: {
  	loaders: [
    	{
    		test: /\.js$/,
    		exclude: /node_modules/,
        include: path.join(__dirname, 'src'),
    		loaders: ['react-hot-loader', 'babel-loader']
    	},
    	{
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract({
                  fallback:  'style-loader', // The backup style loader
                  use: [
                    'css-loader?sourceMap',
                    'postcss-loader',
                    'sass-loader?sourceMap'
                  ]
                }),
        include: path.join(__dirname, 'src/sass')
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
    new webpack.optimize.UglifyJsPlugin({
      minimize: true,
      compress: {
        warnings: false
      }
    }),
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new ExtractTextPlugin('public/app.css')
  ],

  resolve: {
    extensions: [' ', '.js', '.jsx']
  }

};