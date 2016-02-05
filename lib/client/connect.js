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
	
	var _self     = env._self;
	
	// constants
	var STATUS    = env.statics.status;
	
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
						_self.status    = STATUS.CONNECTED;
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
	
	return _self;
};