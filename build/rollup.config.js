import babel from 'rollup-plugin-babel'
import babelrc from 'babelrc-rollup'

const babelConfig = {
  presets: [ [ 'env' ] ]
}

const rc = Object.assign(babelrc({
  addExternalHelpersPlugin: true,
  runtimeHelpers: true,
  config: babelConfig,
  exclude: 'node_modules/**'
}), {
  runtimeHelpers: true
})

console.log(JSON.stringify(rc, null, '  '))

export default {
  input: 'src/index.js',
  external: [
    'url',
    'fs',
    'path',
    'events',
    'bluebird',
    'debug',
    'lodash',
    'node-localstorage',
    'request',
    'rxjs',
    'semver',
    'xmlbuilder',
    'xmldom'
  ],
  plugins: [ babel(rc) ],
  output: {
    format: 'cjs',
    file: 'index.js'
  }
}
