import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: './index.ts',
    output: {
      file: '../../dist/idb-proxy/idb-proxy.umd.js',
      format: 'umd',
      name: 'IdbProxy',
      sourcemap: true,
    },
    plugins: [
      copy({
        targets: [
          {
            src: ['README.md', 'SKILL.md', 'package.json'],
            dest: '../../dist/idb-proxy',
          },
          {
            src: ['../../LICENSE'],
            dest: '../../dist/idb-proxy',
          },
        ],
        verbose: true,
      }),
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/idb-proxy',
        declaration: false,
      }),
      resolve(),
      commonJS({ include: ['node_modules/**'] }),
      terser(),
    ],
  },
  {
    input: './index.ts',
    external: [/^@actualwave\/deferred-data-access/],
    output: {
      file: '../../dist/idb-proxy/idb-proxy.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/idb-proxy',
        declaration: false,
      }),
    ],
  },
];
