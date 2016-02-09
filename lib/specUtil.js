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
		return {
			attributes: {
				'xsi:type': 'TraversalSpec'
			},
			type: args.listSpec.type,
			path: args.listSpec.path,
			skip: false
		};
	}
	
	
	// new selection spec
	function selectionSpec(args) {
		return [traversalSpec(args)];
	}
	

	// new object spec
	function objectSpec(args) {
		
		var set = [];
		
		if (!args.id) {
			
			// create a base object
			var spec = { attributes: { 'xsi:type': 'ObjectSpec' } };
			
			// check for containerview
			if (args.listSpec.type === 'ContainerView' && args.containerView) {
				spec.obj       = args.containerView;
			}
			else {
				spec.obj       = util.moRef(args.listSpec.type, args.listSpec.id);
			}
			
			// set the skip and select set
			spec.skip      = (typeof(args.skip) === 'boolean') ? args.skip : true;
			spec.selectSet = selectionSpec(args);
			
			// push the object
			set.push(spec);
		}
		else {
			// ensure args.id is an array of ids even if there is only one id
			args.id = Array.isArray(args.id) ? args.id : [args.id];
			
			// loop through each if and create an object spec
			_.forEach(args.id, function(id) {
				set.push({
					attributes: {
						'xsi:type': 'ObjectSpec',
					},
					obj: util.moRef(args.type, id)
				});
			});
		}
		
		// return the specSet
		return set;
	}
	
	// new property spec
	function propertySpec(args) {
		
		// create a basic specification
		var spec = {
			attributes: {
				'xsi:type': 'PropertySpec'
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
			spec.all = true;
		}
		
		// return the specification
		return [spec];
	}
	
	
	// new filter spec
	function propertyFilterSpec(args) {

		// new filter spec
		return {
			attributes: {
				'xsi:type': 'PropertyFilterSpec'
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