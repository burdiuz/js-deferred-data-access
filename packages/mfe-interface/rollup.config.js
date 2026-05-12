import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: './index.ts',
    output: {
      file: '../../dist/mfe-interface/mfe-interface.umd.js',
      format: 'umd',
      name: 'MFEInterface',
      sourcemap: true,
    },
    plugins: [
      copy({
        targets: [
          {
            src: ['README.md', 'SKILL.md', 'package.json'],
            dest: '../../dist/mfe-interface',
          },
          {
            src: ['../../LICENSE'],
            dest: '../../dist/mfe-interface',
          },
        ],
        verbose: true,
      }),
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/mfe-interface',
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
      file: '../../dist/mfe-interface/mfe-interface.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/mfe-interface',
        declaration: false,
      }),
    ],
  },
];
