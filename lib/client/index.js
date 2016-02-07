/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */

module.exports = function(env) {
	
	// global modules
	var Promise   = env.promise;
	var soap      = env.soap;
	var Cookie    = env.cookie;
	var _         = env.lodash;
	var util      = env.util;
	
	// save a pointer to the module object
	var _self     = this;
	env._self     = _self;
	
	// constants
	var STATUS    = env.statics.status;
	
	// methods. the order of the require statements matters since
	// some of the methods have dependencies on others
	_self.errorHandler          = require('./errorHandler')(env);
	_self.method                = require('./method')(env);
	_self.logIn                 = require('./logIn')(env);
	_self.logOut                = require('./logOut')(env);
	_self.getServiceContent     = require('./getServiceContent')(env);
	_self.getServiceProperties  = require('./getServiceProperties')(env);
	_self.searchManagedEntities = require('./searchManagedEntities')(env);
	_self.findAllByDnsName      = require('./findAllByDnsName')(env);
	_self.findVmByDnsName       = require('./findVmByDnsName')(env);
	_self.destroyManagedEntity  = require('./destroyManagedEntity')(env);
	_self.renameManagedEntity   = require('./renameManagedEntity')(env);

	
	/**
	 * initialize function, creates a soap client instance and logs in
	 */
	_self._init = function() {
		return new Promise(function(resolve, reject) {
			soap.createClient(_self.wsdl, _self.options, function(err, client) {

				if (err) {
					_self.errorHandler(err, 'Init', null, resolve, reject);
				}
				else {
					_self.client = client;
					_self.logIn().then(function(connection) {
						resolve(connection);
					});
				}
			});
		});
	};
	
	/**
	 * Constructor
	 */
	return function(host, user, password, ignoreSSL, maxRetry) {
		
		// set properties
		_self.status    = STATUS.UNINITIALIZED;
		_self.retry     = 0;
		_self.options   = {};
		_self.maxRetry  = !isNaN(maxRetry) ? maxRetry : 1;
		_self.host      = host;
		_self.user      = user;
		_self.password  = password;
		_self.ignoreSSL = ignoreSSL;
		_self.endpoint  = 'https://' + _self.host + '/sdk/vimService';
		_self.wsdl      = _self.endpoint + '.wsdl';
		_self.options   = {
			endpoint: _self.endpoint,
			forceSoap12Headers: false
		};
		
		// set SSL options
		if (_self.ignoreSSL === true) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
		}
		
		// initialize the client
		return _self._init().then(function() {
			return _self;
		});
	};
};