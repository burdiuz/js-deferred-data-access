import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const keepDirStruct = (name, extension, fullPath) => fullPath;

export default [
  {
    input: './index-module.ts',
    output: {
      file: '../../dist/deferred-data-access/deferred-data-access.umd.js',
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
              'SKILL.md',
            ],
            dest: '../../dist/deferred-data-access',
            rename: keepDirStruct,
          },
          {
            src: ['../../LICENSE'],
            dest: '../../dist/deferred-data-access',
          },
        ],
        verbose: true,
      }),
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/deferred-data-access',
        declaration: false,
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
    external: ['@actualwave/weak-storage', 'tslib'],
    output: {
      file: '../../dist/deferred-data-access/deferred-data-access.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/deferred-data-access',
        declaration: false,
      }),
    ],
  },
];
