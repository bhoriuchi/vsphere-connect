import _ from 'lodash';
import EventEmitter from 'events';
import vSphereSoap from './soap/index';
import cacheKey from './common/cacheKey';
import typeResolver from './common/typeResolver';
import methods from './methods/index';
import v from './v';

export class VsphereConnectClient extends EventEmitter {
  /**
   *
   * @param host {String} - viServer
   * @param [options] {Object} - connection options
   * @param [options.ignoreSSL=false] {Boolean} - ignores invalid ssl
   * @param [options.cacheKey] {Function} - cache key function whose
   * return value will be used as the cache key name
   * @return {v}
   */
  constructor(host, options) {
    super();
    this.loggedIn = false;

    if (!_.isString(host) || _.isEmpty(host)) {
      throw new Error('missing required parameter "host"');
    }
    const opts = _.isObject(options) && !_.isArray(options) ? options : {};

    opts.cacheKey = _.isFunction(opts.cacheKey) ? opts.cacheKey : cacheKey;

    if (opts.ignoreSSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    this._connection = vSphereSoap
      .createClient(`https://${host}/sdk/vimService.wsdl`, opts)
      .then(client => {
        this._soapClient = client;
        this._VimPort = _.get(client, 'services.VimService.VimPort');

        return this._VimPort.RetrieveServiceContent({
          _this: {
            type: 'ServiceInstance',
            value: 'ServiceInstance',
          },
        });
      })
      .then(result => {
        this.serviceContent = _.get(result, 'returnval');
        this.apiVersion = _.get(this.serviceContent, 'about.apiVersion');
        this.typeResolver = typeResolver(this.apiVersion);
        return { connected: true };
      });

    return new v(this);
  }

  setSecurity(securityObject) {
    this._soapClient.setSecurity(securityObject);
  }

  create(parent, type, config, options) {
    return methods.create.apply(this, [parent, type, config, options]);
  }

  destroy(moRef, options) {
    return methods.destroy.apply(this, [moRef, options]);
  }

  // alias for destroy
  delete(moRef, options) {
    return this.destroy(moRef, options);
  }

  login(identity, password) {
    return methods.login.apply(this, [identity, password]);
  }

  logout() {
    return methods.logout.apply(this, []);
  }

  method(name, args) {
    return methods.method.apply(this, [name, args]);
  }

  moRef(inventoryPath) {
    return methods.moRef.apply(this, [inventoryPath]);
  }

  reconfig(moRef, config, options) {
    return methods.reconfig.apply(this, [moRef, config, options]);
  }

  // alias for reconfig
  update(moRef, config, options) {
    return this.reconfig(moRef, config, options);
  }

  reload(moRef) {
    return methods.reload.apply(this, [moRef]);
  }

  rename(moRef, name, options) {
    return methods.rename.apply(this, [moRef, name, options]);
  }

  retrieve(args, options) {
    return methods.retrieve.apply(this, [args, options]);
  }

  // alias for retrieve
  find(args, options) {
    return this.retrieve(args, options);
  }
}

export { vSphereSoap }

export function vConnect(host, options) {
  return new VsphereConnectClient(host, options);
}
