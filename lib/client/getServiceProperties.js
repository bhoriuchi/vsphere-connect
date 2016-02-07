/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	// modules
	var util      = env.util;
	var _self     = env._self;
	
	// constants
	var STATUS    = env.statics.status;
	
	return function(args) {
		
		var objectSpec   = [{
			attributes: {'xsi:type': 'ObjectSpec'},
			obj: util.moRef(args.type, args.id)
		}];
		
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