/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	// global modules
	var _          = env.lodash;
	var Promise    = env.promise;
	var util       = env.util;
	var objectType = env.schema.utils.objectType;
	var specUtil   = env.specUtil;
	
	// pointer to client object
	var _client    = env._client;
	
	// constants
	var STATUS     = env.statics.status;
	
	
	// continues to get all properties until finished
	function getResults(result, objects) {
		
		// if there are no results, resolve an empty array
		if (!result) {
			return new Promise(function(resolve, reject) {
				resolve([]);
			});
		}
		
		// if the result object is undefined or not an array, make it one
		result.objects = result.objects || [];
		result.objects = Array.isArray(result.objects) ? result.objects : [result.objects];
		objects        = _.union(objects, result.objects);
		
		// if the result has a token, there are more results, continue to get them
		if (result.token) {
			return _client.method('ContinueRetrievePropertiesEx', {
				_this: _client._sc.propertyCollector,
				token: result.token
			})
			.then(function(results) {
				return getResults(results, objects);
			});
		}
		
		// if there are no more results, return the formatted results
		else {
			return new Promise(function(resolve, reject) {
				resolve(env.format(objects));
			});
		}
	}
	
	
	/**
	 * retrieve objects
	 * 
	 * @param {Object} args - Arguments hash
	 * @param {string} args.type - Type of object to retrieve
	 * @param {(string|string[])} [args.id] - id or array of ids to search for
	 * @param {ManagedObjectReference} [args.container=rootFolder] - Container to start search from
	 * @param {boolean} [recursive=true] - Recursive search
	 * @param {string|string[]} [properties] - Array of properties to retrieve. If string value of all, all properties will be retrieved
	 */
	return function(args) {
		
		// make args an array
		args = Array.isArray(args) ? args : [args];
		
		// create a views list
		var views = [];
		
		
		// loop through each arg config
		_.forEach(args, function(arg, idx) {
			
			var type, container, recursive, view;
			
			
			if (typeof(arg) === 'string') {
				type       = arg;
				container  = _client._sc.rootFolder;
				recursive  = true;
				args       = {};
			}
			else if (!arg.type) {
				return util.newError({
					errorCode: 400,
					message: 'Missing type argument'
				});
			}

			// set values to use
			type       = type      || arg.type;
			container  = container || arg.container || _client._sc.rootFolder;
			recursive  = (arg.recursive === false) ? false : true;

			// get the listSpec
			var objType  = objectType(_client.apiVersion, type);
			var listSpec = _.get(objType, 'listSpec');

			// if trying to list an object and there is no list spec, throw a 400
			// if an id is supplied, proceed
			if (!objType) {
				return util.newError({
					errorCode: 400,
					message: 'Invalid object type '
				});
			}
			
			if (!listSpec && !arg.id) {
				return util.newError({
					errorCode: 400,
					message: 'Unable to list vSphere type, try with a specific object id'
				});
			}
			
			
			// add the listSpec to the args
			arg.listSpec = listSpec;
			
			// check if a container view needs to be created and create one
			if (!arg.id && listSpec.type === 'ContainerView') {
				view = _client.method('CreateContainerView', {
					_this: _client._sc.viewManager,
					container: container,
					type: type,
					recursive: recursive
				});
			}
			
			// otherwise use the specific service
			else {
				view = new Promise(function(resolve, reject) {
					resolve({});
				});
			}
			
			// add the view to the views
			views.push({
				index: idx,
				view: view
			});
		});
		

		// get all of the views
		return Promise.each(views, function(v) {
			return v.view.then(function(containerView) {
				args[v.index].containerView = containerView;
			});
			
		})
		.then(function() {
			
			// create a new specSet
			var specSet = [];
			
			// create a filter spec for each
			_.forEach(args, function(arg) {
				specSet.push(specUtil.propertyFilterSpec(arg));
			});
			
			// set the method and params
			var method  = 'RetrievePropertiesEx';
			var params  = {
				_this: _client._sc.propertyCollector,
				specSet: specSet
			};

			// retrieve the properties using the appropriate function
			if (_.includes(['2.5', '4.0'], _client.apiVersion)) {
				method = 'RetrieveProperties';
			}
			else {
				params.options = {};
			}
			
			// retrieve the results
			return _client.method(method, params).then(function(result) {
				return getResults(result, []);
			});
		});
	};
};