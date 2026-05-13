import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const name = 'proxy-guard';

const onwarn = (warning, warn) => {
  if (warning.code === 'UNRESOLVED_IMPORT') throw new Error(warning.message);
  warn(warning);
};

export default [
  {
    onwarn,
    input: './index.ts',
    output: { file: `../../dist/${name}/${name}.umd.js`, format: 'umd', name: 'GuardedProxy', sourcemap: true },
    plugins: [
      copy({
        targets: [
          { src: ['README.md', 'SKILL.md', 'package.json'], dest: `../../dist/${name}` },
          { src: ['../../LICENSE'], dest: `../../dist/${name}` },
        ],
        verbose: true,
      }),
      typescript({ tsconfig: './tsconfig.lib.json', outDir: `../../dist/${name}`, declaration: false }),
      resolve(),
      commonJS({ include: ['node_modules/**'] }),
      terser(),
    ],
  },
  {
    onwarn,
    input: './index.ts',
    external: [/^@actualwave\/deferred-data-access/],
    output: { file: `../../dist/${name}/${name}.js`, format: 'cjs', sourcemap: true },
    plugins: [
      typescript({ tsconfig: './tsconfig.lib.json', outDir: `../../dist/${name}`, declaration: false }),
    ],
  },
];
