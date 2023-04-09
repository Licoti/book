const Path = require('path')
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const Fs = require('fs');

const paths = require('./paths')

//https://github.com/wbkd/webpack-starter/issues/231
// Starts an empty array that will hold all HtmlWebpackPlugin instances
const pages = [];

// Read the src dir
const files = Fs.readdirSync(Path.resolve(__dirname, '../assets'));

// Loop through entries in src dir
files.forEach(function (file) {

  // If the entry doesn't have the extension .html, skip it
  if (!file.match(/\.html$/)) {
    return;
  }

  // Creates a new HtmlWebpackPlugin instance for the current entry
  pages.push(new HtmlWebpackPlugin({
    filename: file,
    template: paths.src + '/' + file, // template file
  }));
});

module.exports = {
  // Where webpack looks to start building the bundle
  entry: [paths.src + '/js/index.js'],

  // Where webpack outputs the assets and bundles
  output: {
    path: paths.build,
    filename: '[name].bundle.js',
    publicPath: '/',
  },

  // Customize the webpack build process
  plugins: [
    // Removes/cleans build folders and unused assets when rebuilding
    new CleanWebpackPlugin(),

    // Copies files from target to destination folder
    new CopyWebpackPlugin({
      patterns: [
        {
          from: paths.srcImages, //prends toutes les images du dossiers images
          to: 'assets/images',
          globOptions: {
            ignore: ['*.DS_Store'],
          },
          noErrorOnMissing: true,
        },
        {
          from: paths.srcJson,
          to: 'assets/json',
        }
      ],
    }),

    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      "window.jQuery":"jquery"
    }),
  ].concat(pages),

  // Determine how modules within the project are treated
  module: {
    rules: [
      // JavaScript: Use Babel to transpile JavaScript files
      { test: /\.js$/, use: ['babel-loader'] },

      // Images: Copy image files to build folder
      { test: /\.(?:ico|gif|png|jpg|jpeg)$/i, type: 'asset/resource' },

      // Fonts and SVGs: Inline files
      { test: /\.(woff(2)?|eot|ttf|otf|svg|)$/, type: 'asset/inline' },

      { test: /\.json$/, type: 'json' },
    ],
  },

  resolve: {
    modules: [paths.src, 'node_modules'],
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': paths.src,
      assets: paths.public,
    },
  },
}
