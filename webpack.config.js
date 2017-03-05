var webpack           = require('webpack'),
    path              = require('path'),
    autoprefixer      = require('autoprefixer'),
    ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: [
    'webpack-dev-server/client?http://localhost:1243',
    'webpack/hot/only-dev-server',
    './src/js/index.js'
  ],

  devtool: 'source-map',

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
    new webpack.optimize.OccurrenceOrderPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new ExtractTextPlugin('public/app.css')
  ],

  // postcss: [ autoprefixer({ browsers: ['last 4 versions'] }) ],

  resolve: {
    extensions: [' ', '.js', '.jsx']
  },

  watch: true

};