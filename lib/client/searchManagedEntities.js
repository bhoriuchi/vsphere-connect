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
	var Promise   = env.promise;

	// pointer to client object
	var _self     = env._self;
	
	// constants
	var STATUS    = env.statics.status;
	
	// continues to get all properties until finished
	function getResults(result, objects, args) {
		
		// if the result object is undefined or not an array, make it one
		result.objects = result.objects || [];
		result.objects = Array.isArray(result.objects) ? result.objects : [result.objects];
		objects        = _.union(objects, result.objects);
		
		// if the result has a token, there are more results, continue to get them
		if (result.token) {
			return _self.method('ContinueRetrievePropertiesEx', {
				_this: _self._sc.propertyCollector,
				token: result.token
			})
			.then(function(results) {
				return getResults(results, objects, args);
			});
		}
		
		// if there are no more results, return the formatted results
		else {
			return new Promise(function(resolve, reject) {
				resolve((args.raw === true) ? result : env.format({objects: objects}));
			});
		}
	}
	
	
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

		// create a view
		return _self.method('CreateContainerView', {
			_this: _self._sc.viewManager,
			container: container,
			type: type,
			recursive: recursive
		})
		.then(function(containerView) {
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
				type: 'ContainerView',
				path: 'view',
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
					obj: containerView,
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

			return _self.method('RetrievePropertiesEx', {
				_this: _self._sc.propertyCollector,
				specSet: [propertyFilterSpec],
				options: options
			})
			.then(function(result) {
				return getResults(result, [], args);
			});
		})
		.caught(function(err) {
			throw err;
		});
	};
};