import type { Configuration } from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

export const mainConfig: Configuration = {
  /**
   * This is the main entry point for your application, it's the first file
   * that runs in the main process.
   */
  entry: './src/index.ts',
  // Put your normal webpack config below here
  module: {
    rules,
  },
  plugins,
  resolve: {
    // See webpack.renderer.config.ts for why .ts must resolve before .js.
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css', '.json'],
  },
  externals: {
    ws: 'commonjs ws',
    ollama: 'commonjs ollama',
  },
};
