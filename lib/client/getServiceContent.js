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
	
	// pointer to client object
	var _client     = env._client;
	
	// constants
	var STATUS    = env.statics.status;
	
	// generic function to get service content
	return function(args) {
		
		// create a params object
		var params = {
			_this: _.get(_client._sc, args.service)
		};
		
		return _client.method(args.method, _.merge(params, args.params))
		.then(function(result) {
			return result;
		})
		.caught(function(err) {
			throw err;
		});
	};
};