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
	var _self     = env._self;
	
	// constants
	var STATUS    = env.statics.status;
	
	// generic function to get service content
	return function(args) {
		
		// create a params object
		var params = {
			_this: _.get(_self._sc, args.service)
		};
		
		return _self.method(args.method, _.merge(params, args.params))
		.then(function(result) {
			return result;
		})
		.caught(function(err) {
			throw err;
		});
	};
};