/**
 * vSphere Util
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
	
	// constants
	var STATUS    = env.statics.status;
	
	// reference to the object
	var _self     = this;
	
	
	/**
	 * error handler
	 */
	_self._error = function(err, method, args) {
		console.log('ERROR', err, method, args);
	};
	
	
	/**
	 * parse the cookie for a session id
	 */
	_self.getSessionId = function(cookie) {
		if (typeof(cookie.cookies) === 'string') {
			var idx = cookie.cookies.indexOf('=');
			if (idx !== -1) {
				return _.trim(cookie.cookies.substring(idx + 1), '"') || null;
			}
		}
		return null;
	};
	
	/**
	 * function to construct a cookie from a session key
	 */
	_self.bakeCookie = function(sessionId) {
		return {
			cookies: 'vmware_soap_session="' + sessionId + '"'
		};
	};
	
	
	/**
	 * executes a VimService method as a promise
	 */
	_self.method = function(name, args) {
		
		// create a new promise
		return new Promise(function(resolve, reject) {
			_self.client.VimService.VimPort[name](args, function(err, result, raw, soapHeader) {
				if (err) {
					if(!_self._error(err, name, args)) {
						reject(err, name, args);
					}
				}
				else {
					resolve(result.returnval);
				}
			});
		});
	};
	
	/**
	 *  Log in
	 */
	_self.logIn = function(sessionKey) {
		if (_self.status === STATUS.DISCONNECTED || _self.status === STATUS.UNINITIALIZED) {
						
			return _self.method('RetrieveServiceContent', {
				'_this': 'ServiceInstance'
			})
			.then(function(si) {
				// set object properties
				_self.status          = STATUS.DISCONNECTED;
				_self.serviceInstance = si;
				_self.sessionManager  = si.sessionManager;

				// if session key authentication
				if (sessionKey) {
					_self.cookie    = _self.bakeCookie(sessionKey);
					_self.sessionId = sessionKey;
					_self.client.setSecurity(_self.cookie);
					return _self.cookie;
				}
				
				// otherwise username password authentication
				else {
					return _self.method('Login', {
						'_this': _self.sessionManager,
						'userName': _self.user,
						'password': _self.password
					})
					.then(function(session) {
						_self.retry     = 0;
						_self.sttus     = STATUS.CONNECTED;
						_self.session   = session;
						_self.cookie    = new Cookie(_self.client.lastResponseHeaders);
						_self.sessionId = _self.getSessionId(_self.cookie);
						_self.client.setSecurity(_self.cookie);
						return _self.cookie;
					})
					.caught(function(err, method, args) {
						_self.status = STATUS.DISCONNECTED;
						_self._error(err, method, args);
					});
				}
			})
			.caught(function(err, method, args) {
				_self.status = STATUS.UNINITIALIZED;
				_self._error(err, method, args);
			});
		}
	};
	
	
	/**
	 * initialize function
	 */
	_self._init = function() {
		return new Promise(function(resolve, reject) {
			soap.createClient(_self.wsdl, _self.options, function(err, client) {
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
		
		// set SSL options
		if (_self.ignoreSSL === true) {
			_self.options = {
				endpoint: _self.endpoint,
				forceSoap12Headers: false
			};
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
		}
		
		// initialize the client
		return _self._init().then(function(cookie) {
			
			return _self;
		});
	};
};