import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: './index.ts',
    output: {
      file: '../../dist/rest-object/dist/rest-object.umd.js',
      format: 'umd',
      name: 'RESTObject',
      sourcemap: true,
    },
    plugins: [
      copy({
        targets: [
          {
            src: ['README.md', 'LICENSE', 'package.json'],
            dest: '../../dist/rest-object',
          },
        ],
        verbose: true,
      }),
      typescript({
        tsconfig: './tsconfig.lib.json',
      }),
      resolve(),
      commonJS({
        include: ['node_modules/**'],
      }),
      terser(),
    ],
  },
  {
    input: './index.ts',
    output: {
      file: '../../dist/rest-object/dist/rest-object.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.lib.json',
      }),
    ],
  },
];
