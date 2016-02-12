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
	var _         = env.lodash;
	
	// pointer to client object
	var _client   = env._client;
	
	// constants
	var STATUS    = env.statics.status;
	
	// execute a method
	return function(name, args, resolve, reject) {

		var msg = {};
		msg[name] = {attributes: {}, $value: args};
		
		var exec = function(resolve, reject) {
			var fn = _client.client.VimService.VimPort[name];
			fn(args, function(err, result, raw, soapHeader) {
				if (err) {
					_client.errorHandler(err, name, args, resolve, reject);
				}
				else {
					_client.retry = 0;
					resolve(_.get(result, 'returnval'));
				}
			});
		};
		
		if (!resolve && !reject) {
			// create a new promise
			return new Promise(function(resolve, reject) {
				exec(resolve, reject);
			});
		}
		else {
			exec(resolve, reject);
		}
	};
};