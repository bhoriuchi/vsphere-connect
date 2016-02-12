/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */

module.exports = function(env) {
	
	// global modules
	var Promise      = env.promise;
	var soap         = env.soap;
	var Cookie       = env.cookie;
	var _            = env.lodash;
	var util         = env.util;
	var nodeutil     = env.nodeutil;
	var EventEmitter = env.event;
	
	/**
	 * Constructor
	 * @param {(Object | string)} args - Argument hash for the client or a resolvable host string
	 * @param {string} args.host - Resolvable host string if args object specified
	 * @param {string} [args.username] - User name to log in with
	 * @param {string} [args.password] - Password for args.username
	 * @param {string} [args.sessionId] - Session ID to log in with
	 * @param {boolean} [args.ignoreSSL=false] - Ignore untrusted SSL certificates
	 * @param {boolean} [args.autoLogin=false] - Client will automatically log in on creation
	 * @param {boolean} [args.exclusive=false] - Log all other connections of that share the same user name and IP. Leave the current session logged in
	 * @param {number} [args.maxRetry=1] - Maximum number of automatic login retries after a disconnect
	 * @param {(Object|boolean)} [args.events] - Event configuration hash or true if events should be monitored
	 * @param {number} [args.events.interval=60000] - Time in milliseconds between event polling intervals, defaults to 1 minute from last poll
	 */
	var Client = function(args) {
		
		// save a pointer to the client instance
		var _client   = this;
		env._client   = _client;
		
		
		// constants
		var STATUS    = env.statics.status;
		
		
		// methods. the order of the require statements matters since
		// some of the methods have dependencies on others
		_client.errorHandler          = require('./errorHandler')(env);
		_client.method                = require('./method')(env);
		_client.logIn                 = require('./logIn')(env);
		_client.logOut                = require('./logOut')(env);
		_client.time                  = require('./time')(env);
		_client.emitEvents            = require('./emitEvents')(env);
		_client.getServiceContent     = require('./getServiceContent')(env);
		_client.getServiceProperties  = require('./getServiceProperties')(env);
		_client.retrieve              = require('./retrieve')(env);
		_client.monitor               = require('./monitor')(env);
		_client.findByName            = require('./findByName')(env);
		_client.findAllByDnsName      = require('./findAllByDnsName')(env);
		_client.findVmByDnsName       = require('./findVmByDnsName')(env);
		_client.destroy               = require('./destroy')(env);
		_client.rename                = require('./rename')(env);

		
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
		_client.status        = STATUS.UNINITIALIZED;
		_client.retry         = 0;
		_client.options       = { login: loginOpts };
		_client.host          = args.host;
		_client.user          = args.username;
		_client.password      = args.password;
		_client.sessionId     = args.sessionId;
		_client.ignoreSSL     = args.ignoreSSL;
		_client.endpoint      = 'https://' + _client.host + '/sdk/vimService';
		_client.wsdl          = _client.endpoint + '.wsdl';
		_client.options.soap  = {
			endpoint: _client.endpoint,
			forceSoap12Headers: false
		};
		
		
		// set SSL options
		if (_client.ignoreSSL === true) {
			process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
		}
		
		
		// set event options
		if (args.events) {
			_client.events          = (args.events === true || !_.isObject(args.events)) ? {} : args.events;
			_client.events.interval = !isNaN(_client.events.interval) ? _client.events.interval : 60000;	
		}
		

		/**
		 * initialize function, creates a soap client instance and logs in
		 */
		_client._init = function() {
			return new Promise(function(resolve, reject) {
				soap.createClient(_client.wsdl, _client.options.soap, function(err, client) {

					if (err) {
						_client.errorHandler(err, 'Init', null, resolve, reject);
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
						_client.client = client;
						
						// get the service content
						if (_client.status === STATUS.UNINITIALIZED) {
							
							// get the service content
							return _client.method('RetrieveServiceContent', {
								'_this': 'ServiceInstance'
							})
							.then(function(sc) {
								
								// set object properties
								_client.status            = STATUS.DISCONNECTED;
								_client.serviceContent    = sc;
								_client._sc               = sc;
								_client.sessionManager    = sc.sessionManager;
								_client.apiVersion        = _.get(sc, 'about.apiVersion');
								
								// check for auto-login
								if (_.get(_client, 'options.login.autoLogin') === true) {
									
									// do the login
									return _client.logIn()
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

		
		// initialize the client
		return _client._init().then(function() {
			return _client;
		});
	};
	
	
	// inherit the event emitter
	nodeutil.inherits(Client, EventEmitter);
	
	// return the client
	return Client;
};