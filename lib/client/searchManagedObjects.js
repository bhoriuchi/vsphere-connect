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
	var _self      = env._self;
	
	// constants
	var STATUS     = env.statics.status;
	
	
	// continues to get all properties until finished
	function getResults(result, objects, args) {
		
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
	
	
	// builds the search specification and starts the search
	return function(args) {
		
		var type, container, recursive, view, options;
		
		if (typeof(args) === 'string') {
			type       = args;
			container  = _self._sc.rootFolder;
			recursive  = true;
			args       = {};
		}
		else if (!args || !args.type) {
			return new Promise(function(resolve, reject) {
				reject({code: 400, message: 'Missing type argument'});
			});
		}

		// set values to use
		options    = {};
		type       = type      || args.type;
		container  = container || args.container || _self._sc.rootFolder;
		recursive  = (args.recursive === false) ? false : true;

		// get the listSpec
		var objType  = objectType(_self.apiVersion, type);
		var listSpec = _.get(objType, 'listSpec');

		// if trying to list an object and there is no list spec, throw a 400
		// if an id is supplied, proceed
		if (!objType) {
			return new Promise(function(resolve, reject) {
				reject({code: 400, message: 'Invalid object type '});
			});
		}
		
		if (!listSpec && !args.id) {
			return new Promise(function(resolve, reject) {
				reject({code: 400, message: 'Unable to list vSphere type, try with a specific object id'});
			});
		}
		
		
		// add the listSpec to the args
		args.listSpec = listSpec;
		
		// check if a container view needs to be created and create one
		if (!args.id && listSpec.type === 'ContainerView') {
			view = _self.method('CreateContainerView', {
				_this: _self._sc.viewManager,
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

		// get the view or null value
		return view.then(function(containerView) {

			// add the containerview to the args
			args.containerView = containerView;
			
			// create a new specSet
			var specSet = [specUtil.propertyFilterSpec(args)];

			// retrieve the properties
			return _self.method('RetrievePropertiesEx', {
				_this: _self._sc.propertyCollector,
				specSet: specSet,
				options: options
			})
			.then(function(result) {
				return getResults(result, [], args);
			});
		});
	};
};