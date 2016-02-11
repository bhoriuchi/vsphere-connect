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
	
	// return a constructor
	return function() {
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
		_self.retrieve              = require('./retrieve')(env);
		_self.monitor               = require('./monitor')(env);
		_self.findByName            = require('./findByName')(env);
		_self.findAllByDnsName      = require('./findAllByDnsName')(env);
		_self.findVmByDnsName       = require('./findVmByDnsName')(env);
		_self.destroy               = require('./destroy')(env);
		_self.rename                = require('./rename')(env);

		
		/**
		 * initialize function, creates a soap client instance and logs in
		 */
		_self._init = function() {
			return new Promise(function(resolve, reject) {
				soap.createClient(_self.wsdl, _self.options.soap, function(err, client) {

					if (err) {
						_self.errorHandler(err, 'Init', null, resolve, reject);
					}
					else {
						
						// update the client message names in the wsdl to comply with vcenter
						// this is a workaround for the node-soap module since v0.8.0 the 
						// request messages append RequestMsg to the soap message causing 
						// the soap request to fail
						var messages = _.get(client, 'wsdl.definitions.messages');
						_.forEach(messages, function(msg) {
							msg.$name = msg.$name.replace(/RequestMsg$/, '');
						});
						
						// set the client
						_self.client = client;
						
						// get the service content
						if (_self.status === STATUS.UNINITIALIZED) {
							
							return _self.method('RetrieveServiceContent', {
								'_this': 'ServiceInstance'
							})
							.then(function(sc) {
								// set object properties
								_self.status            = STATUS.DISCONNECTED;
								_self.serviceContent    = sc;
								_self._sc               = sc;
								_self.sessionManager    = sc.sessionManager;
								_self.apiVersion        = _.get(sc, 'about.apiVersion');
								
								// check for auto-login
								if (_.get(_self, 'options.login.autoLogin') === true) {
									
									// do the login
									return _self.logIn()
									.then(function() {
										resolve(sc);
									})
									.caught(function(err) {
										reject(err.code || 500, err);
									});
								}

								// otherwise resolve the service content
								resolve(sc);
							});
						}
					}
				});
			});
		};
		
		/**
		 * Constructor
		 * @param {(Object | string)} args - Argument hash for the client or a resolvable host string
		 * @param {string} args.host - Resolvable host string if args object specified
		 * @param {string} [args.username] - User name to log in with
		 * @param {string} [args.password] - Password for args.username
		 * @param {string} [args.sessionId] - Session ID to log in with
		 * @param {boolean} [args.ignoreSSL=false] - Ignore untrusted SSL certificates
		 * @param {boolean} [args.autoLogin=false] - Client will automatically log in on creation
		 * @param {boolean} [args.exclusive=false] - Log all other connections of that share the same username and IP. Leave the current session logged in
		 * @param {number} [args.maxRetry=1] - Maximum number of automatic login retries after a disconnect
		 */
		return function(args) {	
		
			// if a string is passed, assume that it is the vsphere host
			args = (typeof(args) === 'string') ? { host: args } : args;
			
			// at least a host must be specified
			if (!_.get(args, 'host')) {
				return util.newError({
					code: 400,
					message: 'No host specified'
				});
			}
			
			// set up the login options
			var loginOpts       = {};
			loginOpts.autoLogin = (args.autoLogin === true) ? true : false;
			loginOpts.maxRetry  = !isNaN(args.maxRetry) ? args.maxRetry : 1;
			loginOpts.exclusive = (typeof(args.exclusive) === 'boolean') ? args.exclusive : false;
			
			// set client properties
			_self.status        = STATUS.UNINITIALIZED;
			_self.retry         = 0;
			_self.options       = { login: loginOpts };
			_self.host          = args.host;
			_self.user          = args.username;
			_self.password      = args.password;
			_self.sessionId     = args.sessionId;
			_self.ignoreSSL     = args.ignoreSSL;
			_self.endpoint      = 'https://' + _self.host + '/sdk/vimService';
			_self.wsdl          = _self.endpoint + '.wsdl';
			_self.options.soap  = {
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
};