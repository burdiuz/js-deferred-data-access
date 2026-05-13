import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const onwarn = (warning, warn) => {
  if (warning.code === 'UNRESOLVED_IMPORT') throw new Error(warning.message);
  warn(warning);
};

export default [
  {
    onwarn,
    input: './index.ts',
    output: {
      file: '../../dist/serviceworker-interface/serviceworker-interface.umd.js',
      format: 'umd',
      name: 'ServiceWorkerInterface',
      sourcemap: true,
    },
    plugins: [
      copy({
        targets: [
          {
            src: ['README.md', 'SKILL.md', 'package.json'],
            dest: '../../dist/serviceworker-interface',
          },
          {
            src: ['../../LICENSE'],
            dest: '../../dist/serviceworker-interface',
          },
        ],
        verbose: true,
      }),
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/serviceworker-interface',
        declaration: false,
      }),
      resolve(),
      commonJS({ include: ['node_modules/**'] }),
      terser(),
    ],
  },
  {
    onwarn,
    input: './index.ts',
    external: [/^@actualwave\/deferred-data-access/],
    output: {
      file: '../../dist/serviceworker-interface/serviceworker-interface.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: '../../dist/serviceworker-interface',
        declaration: false,
      }),
    ],
  },
];
