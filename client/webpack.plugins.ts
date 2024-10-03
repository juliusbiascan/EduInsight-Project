import type IForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';


// eslint-disable-next-line @typescript-eslint/no-var-requires
const CopyWebpackPlugin = require("copy-webpack-plugin");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ForkTsCheckerWebpackPlugin: typeof IForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
const assets = ['img', 'html'];
export const plugins = [
  new ForkTsCheckerWebpackPlugin({
    logger: 'webpack-infrastructure',
  }),
  new CopyWebpackPlugin({
    patterns: [{ from: './node_modules/.prisma/client' }],
  }),
  ...assets.map(asset => {
    return new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/resources/main', asset),
          to: path.resolve(__dirname, '.webpack/main', asset)
        }
      ]
    });
  })
];
