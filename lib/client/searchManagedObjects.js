/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	// global modules
	var _         = env.lodash;
	var util      = env.util;

	// pointer to client object
	var _self     = env._self;
	
	// constants
	var STATUS    = env.statics.status;
	
	return function(args) {
		
		var type, container, recursive;
		
		if (typeof(args) === 'string') {
			type       = args;
			container  = _self._sc.rootFolder;
			recursive  = true;
			args       = {};
		}
		else if (!args || !args.type) {
			return new Promise(function(resolve, reject) {
				reject('missing type argument');
			});
		}

		// set values to use
		type       = type      || args.type;
		container  = container || args.container || _self._sc.rootFolder;
		recursive  = (args.recursive === false) ? false : true;

		
		
		
		
		
		
		
		
		var objectSpec = [];
		var options    = {};
		
		var propertySpec = {
			attributes: {'xsi:type': 'PropertySpec'},
			type: type
		};
		
		if (Array.isArray(args.properties) && args.properties.length > 0) {
			var validPaths = util.filterValidPaths(type, args.properties, _self.apiVersion);
			
			if (validPaths.length > 0) {
				propertySpec.pathSet = validPaths;
			}
		}
		else {
			propertySpec.all = true;
		}
		
		var traversalSpec = {
			attributes: {'xsi:type': 'TraversalSpec'},
			type: 'TaskManager',
			path: 'recentTask',
			skip: false
		};
		
		
		// check for id
		if (args.id) {
			// check if id is an array
			if (Array.isArray(args.id)) {
				_.forEach(args.id, function(id) {
					objectSpec.push({
						attributes: {'xsi:type': 'ObjectSpec'},
						obj: util.moRef(type, id)
					});
				});
			}
			else {
				objectSpec.push({
					attributes: {'xsi:type': 'ObjectSpec'},
					obj: util.moRef(type, args.id)
				});
			}
		}
		else {
			objectSpec.push({
				attributes: {'xsi:type': 'ObjectSpec'},
				obj: util.moRef('TaskManager', 'TaskManager'),
				skip: true,
				selectSet: [ traversalSpec ]
			});
		}

		var propertyFilterSpec = {
			attributes: {'xsi:type': 'PropertyFilterSpec'},
			propSet: [ propertySpec ],
			objectSet: objectSpec
		};
		
		// add options
		if (!isNaN(args.limit)) {
			options.maxObjects = args.limit;
		}

		
		//console.log(JSON.stringify(propertyFilterSpec, null, '  '));
		
		return _self.method('RetrievePropertiesEx', {
			_this: _self._sc.propertyCollector,
			specSet: [propertyFilterSpec],
			options: options
		})
		.then(function(result) {
			return (args.raw === true) ? result : env.format(result);
		});
	};
};