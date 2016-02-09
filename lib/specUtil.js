/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	// modules
	var _          = env.lodash;
	var util       = env.util;
	var objectType = env.schema.utils.objectType;
	
	// new traversal spec
	function traversalSpec(args) {
		
	}
	
	// new selection spec
	function selectionSpec(args) {
		
	}
	
	
	
	// new object spec
	function objectSpec(args) {
		
		var set      = [];
		
		if (!args.id) {
			set.push({
				attributes: {
					"xsi:type": "ObjectSpec"
				}
			});
		}
		else {
			args.id = Array.isArray(args.id) ? args.id : [args.id];
		}
		
		
	}
	
	// new property spec
	function propertySpec(args) {
		
		// create a basic specification
		var spec = {
			attributes: {
				"xsi:type": "PropertySpec"
			},
			type: args.type
		};
		
		// if an array of properties was passed, validate the properties
		if (Array.isArray(args.properties) && args.properties.length > 0) {
			var validPaths = util.filterValidPaths(args.type, args.properties, args.apiVersion);
			
			if (validPaths.length > 0) {
				spec.pathSet = validPaths;
			}
		}
		
		// if the properties is a string literal "all"
		else if (args.properties === 'all') {
			spec.pathSet = true;
		}
		
		// return the specification
		return [spec];
	}
	
	
	// new filter spec
	function propertyFilterSpec(args) {

		// new filter spec
		return {
			attributes: {
				"xsi:type": "PropertyFilterSpec"
			},
			propSet: propertySpec(args),
			objectSet: objectSpec(args)
		};
	}
	
	// return the filterSpec
	return {
		propertyFilterSpec : propertyFilterSpec,
		objectSpec         : objectSpec,
		propertySpec       : propertySpec,
		selectionSpec      : selectionSpec,
		traversalSpec      : traversalSpec
	};
};