import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: './index.ts',
    output: {
      file: '../../dist/websocket-interface/dist/websocket-interface.umd.js',
      format: 'umd',
      name: 'WebSocketInterface',
      sourcemap: true,
    },
    plugins: [
      copy({
        targets: [
          {
            src: ['README.md', 'LICENSE', 'package.json'],
            dest: '../../dist/websocket-interface',
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
      file: '../../dist/websocket-interface/dist/websocket-interface.js',
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
