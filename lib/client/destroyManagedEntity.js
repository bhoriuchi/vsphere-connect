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
	
	var _self     = env._self;
	
	// constants
	var STATUS    = env.statics.status;
	
	_self.destroyManagedEntity = function(args) {
		return _self.method('Destroy_Task', {
			_this: util.moRef(args.type, args.id)
		})
		.then(function(result) {
			return {
				Task: result.$value
			};
		});
	};
};