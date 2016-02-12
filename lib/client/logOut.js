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
	var util      = env.util;
	
	// pointer to client object
	var _client   = env._client;
	
	// constants
	var STATUS    = env.statics.status;
	
	// log out
	return function() {
		var args = {
			_this: _client.sessionManager
		};
		_client.method('Logout', args)
		.then(function(res) {
			
			// set the status to disconnected
			_client.status = STATUS.DISCONNECTED;
			
			// clear the emitEvents interval if one exists
			if (_.has(_client, 'events._interval')) {
				
				var log = [];
				util.log(log, 'Logout requested, clearning interval and exiting');
				
				try {
					clearInterval(_client.events._interval);
					util.log(log, 'Interval cleared');
					
				} catch(err) {}
				
				// emit the final log, RIP log.
				_client.emit('emitlog', log);
			}
			
			// emit a logout event
			_client.emit('logout', [_client.sessionId]);
			
			// return the logout
			return _client.sessionId;
		});
	};
};