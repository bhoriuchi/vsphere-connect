/**
 * vSphere Connect
 *
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 *
 */
module.exports = function(env, c) {

	// modules
	var _         = env.lodash;
	var Cookie    = env.cookie;
	var util      = env.util;
	var Promise   = env.promise;

	// pointer to client object
	var _client   = c._client;

	// constants
	var STATUS    = env.statics.status;

	// function to terminate unused sessions if the client has been requested
	// as exclusive. only sessions from the same user on the same ip are terminated
	function terminate() {

		var sessionIds = [];

		// get the current session list
		return _client.getServiceProperties({
			type: 'SessionManager',
			id: 'SessionManager',
			properties: ['currentSession', 'sessionList']
		})
		.then(function(results) {

			var currentUser = results.currentSession.userName;
			var currentIp   = results.currentSession.ipAddress;
			var currentKey  = results.currentSession.key;

			// look for matches and add them  to the terminate list
			_.forEach(results.sessionList, function(session) {
				if (session.key !== currentKey &&
						session.userName === currentUser &&
						session.ipAddress === currentIp) {
					sessionIds.push(session.key);
				}
			});

			// if there are duplicate sessions terminate them
			if (sessionIds.length > 0) {

				// execute the termination
				return _client.method('TerminateSession', {
					_this: _client.sessionManager,
					sessionId: sessionIds
				})
				.then(function() {

					// emit a logout event for the sessionIds
					_client.emit('logout', sessionIds);
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
	 * @param {boolean} [exclusive] - Exclusive
	 * @param {number} [maxRetry] - Max retries
	 */
	return function(args) {

		// override the client args if more specific login args are supplied
		args             = args || {};
		_client.username   = args.username || _client.user;
		_client.password   = args.password || _client.password;
		_client.sessionId  = args.sessionId || _client.sessionId;
		_client.exclusive  = (typeof(args.exclusive) === 'boolean') ? args.exclusive : _client.exclusive;
		_client.maxRetry   = !isNaN(args.maxRetry) ? args.maxRetry : _client.maxRetry;

		// check if the client is disconnected
		if (_client.status === STATUS.DISCONNECTED || _client.status === STATUS.RECONNECTING) {

			// TODO - make both sessionkey and username login return the session object

			// if session key authentication
			if (_client.sessionId) {
				_client.cookie = util.bakeCookie(_client.sessionId);
				_client.client.setSecurity(_client.cookie);
				_client.status = STATUS.CONNECTED;

				// emit an event
				_client.emit('login', _client.sessionId);

				// get the server time to calculate the difference
				return _client.time().then(function(time) {

					// start the emitter
					_client.emitEvents();

					// return the cookie
					return _client.cookie;
				});
			}

			// otherwise username password authentication
			else if (_client.username && _client.password) {
				return _client.method('Login', {
					'_this': _client.sessionManager,
					'userName': _client.username,
					'password': _client.password
				})
				.then(function(session) {
					_client.cookie    = new Cookie(_client.client.lastResponseHeaders);
					_client.client.setSecurity(_client.cookie);
					_client.retry     = 0;
					_client.status    = STATUS.CONNECTED;
					_client.session   = session;
					_client.sessionId = util.getSessionId(_client.cookie);

					// emit an event
					_client.emit('login', _client.session);

					// if exclusive is set to true, terminate any duplicate sessions
					if (_client.options.login.exclusive === true) {
						return terminate().then(function() {
							return _client.session;
						});
					}
					return _client.session;
				})
				.then(function(session) {

					// get the server time to calculate the difference
					return _client.time().then(function(time) {

						// start the emitter
						_client.emitEvents();

						// return the session
						return session;
					});
				});
			}

			// if no session key or credentials
			return util.newError({
				errorCode: 401,
				message: 'No credentials provided'
			});
		}

		// if already connected send an error
		return util.newError({
			errorCode: 406,
			message: 'Already logged in'
		});
	};
};
