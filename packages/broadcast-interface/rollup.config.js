import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: './index.ts',
    output: {
      file: '../../dist/broadcast-interface/broadcast-interface.umd.js',
      format: 'umd',
      name: 'BroadcastInterface',
      sourcemap: true,
    },
    plugins: [
      copy({
        targets: [
          {
            src: ['README.md', 'SKILL.md', 'package.json'],
            dest: '../../dist/broadcast-interface',
          },
          {
            src: ['../../LICENSE'],
            dest: '../../dist/broadcast-interface',
          },
        ],
        verbose: true,
      }),
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/broadcast-interface',
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
      file: '../../dist/broadcast-interface/broadcast-interface.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/broadcast-interface',
        declaration: false,
      }),
    ],
  },
];
