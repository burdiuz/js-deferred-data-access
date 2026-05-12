import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: './index.ts',
    output: {
      file: '../../dist/rest-object/rest-object.umd.js',
      format: 'umd',
      name: 'RESTObject',
      sourcemap: true,
    },
    plugins: [
      copy({
        targets: [
          {
            src: ['README.md', 'SKILL.md', 'package.json'],
            dest: '../../dist/rest-object',
          },
          {
            src: ['../../LICENSE'],
            dest: '../../dist/rest-object',
          },
        ],
        verbose: true,
      }),
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/rest-object',
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
    external: [/^@actualwave\/deferred-data-access/],
    output: {
      file: '../../dist/rest-object/rest-object.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/rest-object',
      }),
    ],
  },
];
