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
		
		return _self.getServiceProperties({
			type: 'SessionManager',
			id: 'SessionManager',
			properties: ['currentSession', 'sessionList']
		})
		.then(function(results) {
			
			var filter   = {
				userName: results.currentSession.userName,
				ipAddress: results.currentSession.ipAddress
			};
			
			_.forEach(_.filter(results.sessionList, filter), function(session) {
				if (session.key !== results.currentSession.key) {
					sessionIds.push(session.key);
				}
			});
			
			if (sessionIds.length > 0) {
				return _self.method('TerminateSession', {
					_this: util.moRef('SessionManager', 'SessionManager'),
					sessionId: sessionIds
				});
			}
		});
	}
	
	
	// generic function to get service content
	return function(sessionKey) {
		
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
				_self.apiVersion        = _.get(sc, 'about.apiVersion');

				// if session key authentication
				if (sessionKey) {
					_self.cookie    = util.bakeCookie(sessionKey);
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
						_self.status    = STATUS.CONNECTED;
						_self.session   = session;
						_self.sessionId = util.getSessionId(_self.cookie);
						
						if (_self.exclusive === true) {
							return terminate().then(function() {
								return _self.session;
							});
						}
						return _self.session;
					});
				}
			});
		}
	};
};