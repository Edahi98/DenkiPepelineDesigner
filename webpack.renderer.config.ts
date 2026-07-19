import type { Configuration } from 'webpack';
import webpack from 'webpack';

import { rules } from './webpack.rules';
import { plugins } from './webpack.plugins';

rules.push({
  test: /\.css$/,
  use: [
    { loader: 'style-loader' },
    { loader: 'css-loader' },
    { loader: '@tailwindcss/webpack' },
  ],
});

const rendererPlugins = [
  ...plugins,
  new webpack.BannerPlugin({
    banner: `window.addEventListener('error',function(e){if(e.message&&e.message.indexOf('ResizeObserver')!==-1){e.stopImmediatePropagation();e.preventDefault();return false;}},true);`,
    raw: true,
  }),
];

export const rendererConfig: Configuration = {
  module: {
    rules,
  },
  plugins: rendererPlugins,
  resolve: {
    // .ts/.tsx must resolve before .js/.jsx: several shared modules have a
    // stale, out-of-sync compiled .js sibling committed next to the real
    // .ts source (e.g. node_ports.js, dag_builder.js, flow_to_ast.js —
    // all last touched 2026-07-12). With .js first, webpack silently
    // built the bundle from those stale snapshots instead of current
    // source — new exports (isValidConnection) came back
    // "is not a function", and edited logic never took effect at runtime
    // even though it compiled and unit-verified cleanly in isolation.
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.css'],
    conditionNames: ['import', 'module', 'browser', 'default'],
  },
};
