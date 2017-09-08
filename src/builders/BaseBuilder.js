import _ from 'lodash'
import semver from 'semver'

export default class BaseBuilder {
  constructor (apiVersion, defaultConfig) {
    this.apiVersion = apiVersion.match(/^\d+\.\d+$/)
      ? `${apiVersion}.0`
      : apiVersion
    this.config = defaultConfig
  }

  /**
   * Manually sets a configuration value at the specific path
   * @param path
   * @param value
   */
  $set (path, value) {
    _.set(this.config, path, value)
    return this
  }

  /**
   * Merges a subset of configuration into the main config
   * @returns {VirtualMachineConfigBuilder}
   */
  $merge () {
    this.config = _.merge.apply(this, [...arguments].unshift(this.config))
    return this
  }

  /**
   * Checks if the api version is greater than or equal to the required version
   * @param requiredVersion - must be in semver format major.minor.patch
   * @returns {*}
   */
  $versionGTE (requiredVersion) {
    return semver.gte(this.apiVersion, requiredVersion)
  }

  /**
   * Adds dynamic data to the config
   * @param key
   * @param value
   * @returns {BaseBuilder}
   */
  dynamicData (key, value) {
    this.$set(key, value)
    return this
  }
}