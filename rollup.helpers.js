import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import babel from 'rollup-plugin-babel';
// import flow from 'rollup-plugin-flow';
import json from 'rollup-plugin-json';
import uglify from 'rollup-plugin-uglify';
import { minify } from 'uglify-es';

export const plugins = [
  resolve(),
  // flow(),
  babel({
    plugins: [
      'babel-plugin-transform-class-properties',
      'babel-plugin-transform-flow-strip-types',
      ['babel-plugin-transform-object-rest-spread', { useBuiltIns: true }],
      'babel-plugin-external-helpers',
    ],
    exclude: 'node_modules/**',
    externalHelpers: true,
    babelrc: false,
  }),
  commonjs(),
  json(),
];

export const baseConfig = (libraryFileName, libraryVarName) => ({
  input: 'source/index.js',
  output: [
    {
      file: `dist/${libraryFileName}.js`,
      sourcemap: true,
      exports: 'named',
      name: libraryVarName,
      format: 'cjs',
    },
  ],
  plugins,
});

export const minConfig = (libraryFileName, libraryVarName) => ({
  input: 'source/index.js',
  output: [
    {
      file: `dist/${libraryFileName}.min.js`,
      sourcemap: true,
      exports: 'named',
      name: libraryVarName,
      format: 'umd',
    },
  ],
  plugins: [
    ...plugins,
    uglify({}, minify),
  ],
});

export default (libraryFileName, libraryVarName) => ([
  baseConfig(libraryFileName, libraryVarName),
  minConfig(libraryFileName, libraryVarName),
]);
