import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

export default [
  {
    input: './index.ts',
    output: {
      file: '../../dist/webrtc-interface/webrtc-interface.umd.js',
      format: 'umd',
      name: 'WebRTCInterface',
      sourcemap: true,
    },
    plugins: [
      copy({
        targets: [
          {
            src: ['README.md', 'SKILL.md', 'package.json'],
            dest: '../../dist/webrtc-interface',
          },
          {
            src: ['../../LICENSE'],
            dest: '../../dist/webrtc-interface',
          },
        ],
        verbose: true,
      }),
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/webrtc-interface',
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
      file: '../../dist/webrtc-interface/webrtc-interface.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/webrtc-interface',
        declaration: false,
      }),
    ],
  },
];
