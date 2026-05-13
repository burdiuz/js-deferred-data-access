import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonJS from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const keepDirStruct = (name, extension, fullPath) => fullPath;

const onwarn = (warning, warn) => {
  if (warning.code === 'UNRESOLVED_IMPORT') throw new Error(warning.message);
  warn(warning);
};

const subPackages = ['command', 'interface', 'proxy', 'record', 'resource', 'utils'];

const subPackageBuilds = subPackages.flatMap((name) => [
  {
    onwarn,
    input: `./${name}/index.ts`,
    external: ['@actualwave/weak-storage', /^@actualwave\/deferred-data-access/],
    output: {
      file: `../../dist/deferred-data-access/${name}/index.es.js`,
      format: 'esm',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: `../../dist/deferred-data-access/${name}`,
        declaration: false,
      }),
    ],
  },
  {
    onwarn,
    input: `./${name}/index.ts`,
    external: ['@actualwave/weak-storage', /^@actualwave\/deferred-data-access/],
    output: {
      file: `../../dist/deferred-data-access/${name}/index.js`,
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
      typescript({
        tsconfig: './tsconfig.lib.json',
        outDir: `../../dist/deferred-data-access/${name}`,
        declaration: false,
      }),
    ],
  },
]);

export default [
  {
    onwarn,
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
    onwarn,
    input: './index-module.ts',
    external: ['@actualwave/weak-storage'],
    output: {
      file: '../../dist/deferred-data-access/index.es.js',
      format: 'esm',
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
  {
    onwarn,
    input: './index-module.ts',
    external: ['@actualwave/weak-storage'],
    output: {
      file: '../../dist/deferred-data-access/index.js',
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
  ...subPackageBuilds,
];
