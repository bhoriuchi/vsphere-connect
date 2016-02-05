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
	
	_self.getServiceProperties = function(args) {
		
		var type, container, recursive;
		
		
		var objectSpec   = [];
		
		var propertySpec = {
			attributes: {'xsi:type': 'PropertySpec'},
			type: args.type
		};
		
		if (Array.isArray(args.properties) && args.properties.length > 0) {
			propertySpec.pathSet = args.properties;
		}
		else {
			propertySpec.all = true;
		}
		
		
		
		objectSpec.push({
			attributes: {'xsi:type': 'ObjectSpec'},
			obj: util.moRef(args.type, args.id)
		});
		
		
		
		
		var propertyFilterSpec = {
			attributes: {'xsi:type': 'PropertyFilterSpec'},
			propSet: [ propertySpec ],
			objectSet: objectSpec
		};
		
		

		
		
		return _self.method('RetrievePropertiesEx', {
			_this: _self._sc.propertyCollector,
			specSet: [propertyFilterSpec],
			options: {}
		})
		.then(function(result) {
			return (args.raw === true) ? result : env.format(result);
		})
		.caught(function(err) {
			throw err;
		});
	};
};