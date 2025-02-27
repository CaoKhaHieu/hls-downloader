const path = require("path");

module.exports = {
  entry: {
    'hls-downloader': './lib/hls-downloader.ts',
    'hls-manager': './lib/hls-manager.ts'
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  mode: "production",
};
