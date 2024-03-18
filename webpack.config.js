const path = require('path');
const fs = require('fs');
const Dotenv = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin'); 

module.exports = {
  mode: 'production',
  entry: './server.js',
  stats: {warnings:false},
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/',
    filename: 'server-prod.js',
  },
  target: 'node',
  plugins: [
    new Dotenv({
      path: './.env',
      systemvars: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'index.html'),
          to: path.resolve(__dirname, 'dist'),
        },
        {
          from: path.resolve(__dirname, 'node_modules/socket.io/client-dist/socket.io.js'),
          to: path.resolve(__dirname, 'dist/'),
        },
      ],
    }),
  ],
};