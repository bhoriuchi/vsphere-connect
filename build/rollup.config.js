import babel from 'rollup-plugin-babel'

export default {
  entry: 'src/index.js',
  format: 'cjs',
  plugins: [ babel() ],
  external: ['lodash', 'events', 'soap-connect', 'bluebird'],
  dest: 'index.js'
}