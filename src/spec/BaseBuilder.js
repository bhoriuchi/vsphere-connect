import _ from 'lodash'
import semver from 'semver'
import { isMoRef, moRef } from "../../src/common/moRef"

export default class BaseBuilder {
  constructor (client, defaultConfig) {
    this._resolve = Promise.resolve()
    this.client = client
    this.apiVersion = client.apiVersion.match(/^\d+\.\d+$/)
      ? `${this.client.apiVersion}.0`
      : this.client.apiVersion
    this._config = defaultConfig
  }

  /**
   * Creates a copy of the config and returns it
   */
  $config () {
    return _.merge({}, this._config)
  }

  /**
   * Gets a value from the config object
   * @param path
   * @param defaultValue
   */
  $get (path, defaultValue) {
    return _.get(this._config, path, defaultValue)
  }

  /**
   * Manually sets a configuration value at the specific path
   * @param path
   * @param value
   */
  $set (path, value) {
    _.set(this._config, path, value)
    return this
  }

  $push (path, value) {
    let obj = this.$get(path)
    if (!_.isArray(obj)) this.$set(path, [])
    obj = this.$get(path)
    obj.push(value)
    return this
  }

  /**
   * Merges a subset of configuration into the main config
   * @returns {VirtualMachineConfigBuilder}
   */
  $merge () {
    this._config = _.merge.apply(this, [...arguments].unshift(this._config))
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
   * Checks if the values passed is formatted as a moref
   * @param value
   * @returns {*}
   */
  $isMoRef (value) {
    return isMoRef(value)
  }

  /**
   * converts a type and value to a moref
   * @param type
   * @param value
   * @returns {{type, value}|*}
   */
  $moRef (type, value) {
    return moRef(type, value)
  }

  /**
   * resolves a moref by path or moref
   * @param value
   * @param field
   * @returns {BaseBuilder}
   */
  $resolveMoRef (value, field) {
    this._resolve = this._resolve.then(() => {
      let getMoRef = _.isString(value)
        ? this.client.moRef(value)
        : this.$isMoRef(value)
          ? Promise.resolve(value)
          : Promise.reject(new Error(`invalid moRef supplied for "${field}"`))
      return getMoRef.then(moRef => this.$set(field, moRef))
    })

    return this
  }

  $resolveAndSet (value, path) {
    this._resolve = this._resolve.then(() => {
      this.$set(path, value)
    })

    return this
  }

  /**
   * checks if the value is a potential config object
   * @param value
   * @returns {boolean}
   */
  $isConfigObject (value) {
    return _.isObject(value) && !_.isBuffer(value) && !_.isDate(value) && _.keys(value).length
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