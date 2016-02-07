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
	var _self     = env._self;
	
	// constants
	var STATUS    = env.statics.status;
	
	// execute a method
	return function(name, args, resolve, reject) {

		var exec = function(resolve, reject) {
			var fn = _self.client.VimService.VimPort[name];
			fn(args, function(err, result, raw, soapHeader) {
				if (err) {
					_self.errorHandler(err, name, args, resolve, reject);
				}
				else {
					_self.retry = 0;
					resolve(result.returnval);
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