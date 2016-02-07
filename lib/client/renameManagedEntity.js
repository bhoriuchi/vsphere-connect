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
	var _self     = env._self;
	
	// constants
	var STATUS    = env.statics.status;
	
	return function(args) {
		return _self.method('Rename_Task', {
			_this: util.moRef(args.type, args.id),
			newName: args.name
		})
		.then(function(result) {
			return {
				Task: result.$value
			};
		});
	};
};