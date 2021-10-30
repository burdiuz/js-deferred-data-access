import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';

const keepDirStruct = (name, extension, fullPath) => fullPath;

export default [
  {
    input: './index-module.ts',
    output: {
      file: '../../dist/deferred-data-access/dist/deferred-data-access.umd.js',
      format: 'umd',
      name: 'DeferredDataAccess',
      sourcemap: true,
    },
    plugins: [
      copy({
        targets: [
          {
            src: [
              './[!node_]**/package.json',
              './[!node_]**/README.md',
              'package.json',
              'README.md',
              'LICENSE',
            ],
            dest: '../../dist/deferred-data-access',
            rename: keepDirStruct,
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
    input: './index-module.ts',
    output: {
      file: '../../dist/deferred-data-access/dist/deferred-data-access.js',
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
