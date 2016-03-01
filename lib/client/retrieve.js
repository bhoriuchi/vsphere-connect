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
	 * @param {Object} [options] - Options Hash
	 * @param {number} [options.maxObjects] - Max objects to retrieve
	 */
	return function(args, options) {
		
		// make args an array
		args    = Array.isArray(args) ? args : [args];
		options = options || {};
		
		// get a new propertySpec
		return _client.propertySpec(args).then(function(specSet) {
			
			// set the method and params
			var method  = 'RetrievePropertiesEx';
			var params  = {
				_this: _client._sc.propertyCollector,
				specSet: specSet
			};

			// retrieve the properties using the appropriate function
			if (util.versionCmp(_client.apiVersion, '4.1') === 'lt') {
				method = 'RetrieveProperties';
			}
			else {
				params.options = _.pick(options, ['maxObjects']);
			}
			
			// retrieve the results
			return _client.method(method, params).then(function(result) {
				return getResults(result, []);
			});
		});
	};
};