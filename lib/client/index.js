/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */

module.exports = function(env) {
	
	// modules
	var Promise   = env.promise;
	var soap      = env.soap;
	var constants = env.constants;
	var toxml     = env.toxml;
	var Cookie    = env.cookie;
	var _         = env.lodash;
	var util      = env.util;
	
	// register modules
	var _self     = this;
	env._self     = _self;
	require('./connect')(env);
	require('./searchManagedEntities')(env);
	require('./getServiceContent')(env);
	require('./getServiceProperties')(env);
	require('./destroyManagedEntity')(env);

	// constants
	var STATUS    = env.statics.status;
	
	
	
	/**
	 * initialize function
	 */
	_self._init = function() {
		return new Promise(function(resolve, reject) {
			soap.createClient(_self.wsdl, _self.options, function(err, client) {
				
				/*
				client.on('request', function(req) {
					console.log(req);
				});
				*/
				
				if (err) {
					reject(err, 'INIT', null);
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
	 * executes a VimService method as a promise
	 */
	_self.method = function(name, args, resolve, reject) {

		var exec = function(resolve, reject) {
			
			var fn = _self.client.VimService.VimPort[name];
			fn(args, function(err, result, raw, soapHeader) {
				if (err) {

					if (_self.retry < _self.maxRetry) {
						_self.status = STATUS.DISCONNECTED;
						_self.retry++;
						_self.logIn().then(function() {
							_self.method(name, args, resolve, reject);
						});
					}
					else {
						_self.status = STATUS.DISCONNECTED;
						reject(err, name, args);
					}
				}
				else {
					resolve(result.returnval);
					_self.retry = 0;
				}
			});
		};
		
		
		if (!resolve && !reject) {

			// create a new promise
			return new Promise(function(resolve, reject) {
				exec(resolve, reject);
			});
		}
		else {
			exec(resolve, reject);
		}
	};
	
	
	/**
	 * error handler
	 */
	_self._error = function(err, method, args) {
		console.log('ERROR', err, method, args);
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