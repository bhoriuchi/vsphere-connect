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
	
	// pointer to client object
	var _self     = env._self;
	
	// constants
	var STATUS    = env.statics.status;
	
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
						return _self.session;
					});
				}
			});
		}
	};
};