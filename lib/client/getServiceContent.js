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
	var soap      = env.soap;
	var constants = env.constants;
	var toxml     = env.toxml;
	var Cookie    = env.cookie;
	var _         = env.lodash;
	var util      = env.util;
	
	var _self     = env._self;
	
	// constants
	var STATUS    = env.statics.status;
	
	// generic function to get service content
	_self.getServiceContent = function(args) {
		
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
	
	// find by dns name
	_self.findAllByDnsName = function(args) {
		return _self.getServiceContent({
			method: 'FindAllByDnsName',
			service: 'searchIndex',
			params: {
				dnsName: args.dnsName,
				vmSearch: args.vmSearch
			}
		})
		.then(function(result) {
			return _.map(result, '$value');
		});
	};
	
	// find vms by dns name
	_self.findVmByDnsName = function(name) {
		return _self.findAllByDnsName({
			dnsName: name,
			vmSearch: true
		});
	};
};