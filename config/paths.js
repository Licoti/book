const path = require('path')

module.exports = {
  // Source files
  src: path.resolve(__dirname, '../assets'),

  // Production build files
  build: path.resolve(__dirname, '../public/build'),

  // Static files that get copied to build folder
  public: path.resolve(__dirname, '../public'),

  srcImages: path.resolve(__dirname, '../assets/images'),

  srcJson: path.resolve(__dirname, '../assets/json'),
}
