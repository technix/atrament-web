import path from 'path';
import TerserPlugin from 'terser-webpack-plugin'; /* eslint-ignore */

export default (env, argv) => (
  {
    devtool: 'source-map',
    entry: {
      atrament: ['./src/index.js'],
      'atrament-jszip': ['./src/index-jszip.js']
    },
    output: {
      path: path.resolve(__dirname, 'umd'),
      publicPath: '/',
      filename: '[name].js',
      globalObject: 'typeof self !== \'undefined\' ? self : this',
      library: {
        name: 'atrament',
        type: 'umd',
        export: 'default'
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        }
      ]
    },
    optimization: {
      minimizer: [
        new TerserPlugin({
          parallel: true
        })
      ]
    }
  }
);
