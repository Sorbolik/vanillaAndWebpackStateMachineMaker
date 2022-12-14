const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");

// Runs in nodejs
module.exports = (env, argv) => {
  return {
    entry: {
      main: "./src/index.js",
    },
    output: {
      path: path.resolve(__dirname, "./dist"),
      filename: "[name].bundle.js",
    },
    target: "web", // needed or live reload fails
    devtool: argv.mode === "production" ? "cheap-source-map" : "inline-source-map",
    devServer: {
      contentBase: "dist",
      publicPath: "/",
      open: true,
      hot: false,
      liveReload: true,
      historyApiFallback: true, // SPA
    },
    module: {
      rules: [
        {
          test: /\.m?js$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader",
            options: {
              presets: ["@babel/preset-env"],
            },
          },
        },
        {
          test: /\.html$/i,
          use: ["raw-loader"],
        },
        {
          test: /\.css$/i,
          use: ["raw-loader"],
        },
      ],
    },
    plugins: [
      // new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: "./index.html", // template file
        filename: "index.html", // output file
      }),
      new CopyPlugin({
        patterns: [
          { from: "src/assets", to: "assets" },
          { from: "src/global.css", to: "global.css" },
          { from: "src/reset.css", to: "reset.css" }
        ],
      }),
    ],
    optimization: {
      minimize: argv.mode === "production",
    },
  };
};
