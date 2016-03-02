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
	
	// pointer to client object
	var _client   = c._client;
	
	// constants
	var STATUS    = env.statics.status;
	
	// get time
	return function() {
		
		// get the current server time
		return _client.method('CurrentTime', {
			_this: 'ServiceInstance'
		})
		.then(function(time) {
			
			// calculate the difference between the server time
			// and the client time
			var clientTime      = Date.now();
			var serverTime      = new Date(time);
			_client._timeOffset = (clientTime - serverTime.valueOf());

			// return the time
			return serverTime;
		});
	};
};