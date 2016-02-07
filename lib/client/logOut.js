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
	
	// log out
	return function() {
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
};