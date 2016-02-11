/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	// modules
	var _         = env.lodash;
	var Cookie    = env.cookie;
	var util      = env.util;
	var Promise   = env.promise;
	
	// pointer to client object
	var _self     = env._self;
	
	// constants
	var STATUS    = env.statics.status;
	
	// function to terminate unused sessions if the client has been requested
	// as exclusive. only sessions from the same user on the same ip are terminated
	function terminate() {
		
		var sessionIds = [];
		
		// get the current session list
		return _self.getServiceProperties({
			type: 'SessionManager',
			id: 'SessionManager',
			properties: ['currentSession', 'sessionList']
		})
		.then(function(results) {
			
			// find all sessions that have the same username and ipAddress
			// this indicates they are from the same user
			var filter   = {
				userName: results.currentSession.userName,
				ipAddress: results.currentSession.ipAddress
			};
			
			_.forEach(_.filter(results.sessionList, filter), function(session) {
				if (session.key !== results.currentSession.key) {
					sessionIds.push(session.key);
				}
			});
			
			// if there are duplicate sessions terminate them
			if (sessionIds.length > 0) {
				return _self.method('TerminateSession', {
					_this: _self.sessionManager,
					sessionId: sessionIds
				});
			}
		});
	}	
	
	/**
	 * Log into the viServer
	 * @param {Object} [args] - Login options hash
	 * @param {string} [username] - Username to log in with
	 * @param {string} [password] - Password for username
	 * @param {string} [sessionId] - Session ID to log in with
	 */
	return function(args) {
		
		// override the client args if more specific login args are supplied
		args             = args || {};
		_self.username   = args.username || _self.user;
		_self.password   = args.password || _self.password;
		_self.sessionId  = args.sessionId || _self.sessionId;
		_self.exclusive  = (typeof(args.exclusive) === 'boolean') ? args.exclusive : _self.exclusive;
		_self.maxRetry   = !isNaN(args.maxRetry) ? args.maxRetry : _self.maxRetry;
		
		// check if the client is disconnected
		if (_self.status === STATUS.DISCONNECTED) {
			
			// TODO - make both sessionkey and username login return the session object
			
			// if session key authentication
			if (_self.sessionId) {
				_self.cookie = util.bakeCookie(_self.sessionId);
				_self.client.setSecurity(_self.cookie);
				return new Promise(function(resolve, reject) {
					resolve(_self.cookie);
				});
			}
			
			// otherwise username password authentication
			else if (_self.user && _self.password) {
				return _self.method('Login', {
					'_this': _self.sessionManager,
					'userName': _self.username,
					'password': _self.password
				})
				.then(function(session) {
					_self.cookie    = new Cookie(_self.client.lastResponseHeaders);
					_self.client.setSecurity(_self.cookie);
					_self.retry     = 0;
					_self.status    = STATUS.CONNECTED;
					_self.session   = session;
					_self.sessionId = util.getSessionId(_self.cookie);
					
					if (_self.options.login.exclusive === true) {
						return terminate().then(function() {
							return _self.session;
						});
					}
					return _self.session;
				});
			}

			// if no session key or credentials
			return util.newError({
				code: 401,
				message: 'No credentials provided'
			});
		}
		
		// if already connected send an error
		return util.newError({
			code: 406,
			message: 'Already logged in'
		});
	};
};