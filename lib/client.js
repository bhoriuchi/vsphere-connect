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
			
			var fn = _self.client.VimService.VimPort[name];
			fn(args, function(err, result, raw, soapHeader) {
				if (err) {
					reject(err, name, args);
				}
				else {
					resolve(result.returnval);
				}
			});
		});
	};
	
	/**
	 * format a response
	 */
	_self.format = function(response) {
		
		var output = [];
		
		if (response && Array.isArray(response.objects)) {
			_.forEach(response.objects, function(obj) {

				var o  = {};
				o.id   = obj.obj.$value;
				o.type = obj.obj.attributes.type;
				
				_.forEach(obj.propSet, function(prop) {
					console.log(prop.val.attributes['xsi:type']);
					
					if (prop.val.attributes['xsi:type'] === 'xsd:string') {
						o[prop.name] = prop.val.$value;
					}
					else if (prop.val.attributes['xsi:type'] === 'xsd:boolean') {
						o[prop.name] = Boolean(prop.val.$value);
					}
					else if (prop.val.attributes['xsi:type'] === 'ArrayOfManagedObjectReference') {
						o[prop.name] = [];

						if (Array.isArray(prop.val.ManagedObjectReference)) {
							_.forEach(prop.val.ManagedObjectReference, function(mor) {
								o[prop.name].push({
									type: mor.attributes.type,
									value: mor.$value
								});
							});
						}
						else if (prop.val.ManagedObjectReference && typeof(prop.val.ManagedObjectReference) === 'object') {
							o[prop.name].push({
								type: prop.val.ManagedObjectReference.attributes.type,
								value: prop.val.ManagedObjectReference.$value
							});
						}

					}
				});
				output.push(o);
			});
		}
		return output;
	};
	
	/**
	 * find managed entities
	 */
	_self.searchManagedEntities = function(args) {
		
		var type, container, recursive, properties;
		
		if (typeof(args) === 'string') {
			type       = args;
			container  = _self._sc.rootFolder;
			recursive  = true;
			args       = {};
		}
		else if (!args || !args.type) {
			return new Promise(function(resolve, reject) {
				reject('missing type argument');
			});
		}

		// set values to use
		type       = type      || args.type;
		container  = container || args.container || _self._sc.rootFolder;
		recursive  = (args.recursive === false) ? false : true;
		properties = Array.isArray(args.properties) ? args.properties : true;
		
		// create a view
		return _self.method('CreateContainerView', {
			_this: _self._sc.viewManager,
			container: container,
			type: type,
			recursive: recursive
		})
		.then(function(containerView) {
			
			var propertySpec = {
				attributes: {'xsi:type': 'PropertySpec'},
				type: type
			};
			
			if (Array.isArray(properties)) {
				propertySpec.pathSet = properties;
			}
			else {
				propertySpec.all = true;
			}
			
			var traversalSpec = {
				attributes: {'xsi:type': 'TraversalSpec'},
				type: 'ContainerView',
				path: 'view',
				skip: false
			};
			var objectSpec = {
				attributes: {'xsi:type': 'ObjectSpec'},
				obj: containerView,
				skip: true,
				selectSet: [ traversalSpec ]
			};
			var propertyFilterSpec = {
				attributes: {'xsi:type': 'PropertyFilterSpec'},
				propSet: [ propertySpec ],
				objectSet: [ objectSpec ]
			};
			
			
			
			return _self.method('RetrievePropertiesEx', {
				_this: _self._sc.propertyCollector,
				specSet: [propertyFilterSpec],
				options: {}
			}).then(function(result) {				
				return _self.format(result);
			});
		})
		.caught(function(err) {
			console.log('ERROR', err);
		});
	};
	
	/**
	 * Log Out
	 */
	_self.logOut = function() {
		var args = {
			_this: _self.sessionManager
		};
		_self.method('Logout', args)
		.then(function(res) {
			return res;
		})
		.caught(function(err) {
			console.log('err', err);
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
			.then(function(sc) {
				// set object properties
				_self.status            = STATUS.DISCONNECTED;
				_self.serviceContent    = sc;
				_self._sc               = sc;
				_self.sessionManager    = sc.sessionManager;

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
						_self.cookie    = new Cookie(_self.client.lastResponseHeaders);
						_self.client.setSecurity(_self.cookie);
						_self.retry     = 0;
						_self.sttus     = STATUS.CONNECTED;
						_self.session   = session;
						_self.sessionId = _self.getSessionId(_self.cookie);
						return _self.session;
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
				
				/*
				client.on('request', function(req) {
					console.log(req);
				});
				*/
				
				if (err) {
					console.log('errhere');
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
		return _self._init().then(function() {
			
			return _self;
		});
	};
};