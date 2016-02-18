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
	var Promise    = env.promise;
	var objectType = env.schema.utils.objectType;
	var specUtil   = env.specUtil;
	
	// pointer to client object
	var _client    = env._client;

	
	// create a new specset
	return function(args) {

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
			
			// return the spec set
			return specSet;
		});
	};
};