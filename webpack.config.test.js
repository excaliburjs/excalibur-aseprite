const path = require("path")
module.exports = {
 entry: './example/main.ts',
 mode: 'development',
 devtool: 'source-map',
 devServer: {
   static: '.',
 },
 module: {
   rules: [
     {
       test: /\.ts$/,
       use: 'ts-loader',
       exclude: /node_modules/
     }
   ]
 },
 resolve: {
   fallback: {
      fs: false
   },
   extensions: [".ts", ".js"],
   alias: {
      "@excalibur-aseprite": path.resolve(__dirname, './src/')
   }
 },
 output: {
   filename: './example/main.js',
   path: __dirname,
   libraryTarget: "umd"
 }
};