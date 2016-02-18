/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	// global modules
	var _           = env.lodash;
	var Promise     = env.promise;
	var util        = env.util;
	var objectType  = env.schema.utils.objectType;
	var specUtil    = env.specUtil;
	
	// pointer to client object
	var _client     = env._client;
	
	// constants
	var STATUS      = env.statics.status;
	
	// define a minimum interval of 1 minute
	var minInterval = 60000;
	
	
	// function to get updates
	function getUpdates() {
		return _client.method('WaitForUpdatesEx', {
			_this: _client._updatesCollector,
			version: _client._updatesVersion,
			options: {
				maxWaitSeconds: 0
			}
		})
		.then(function(set) {
			if (set) {
				
				// update the version
				_client._updatesVersion = set.version;
				
				// get only the updates
				var updates = _.get(set, 'filterSet.objectSet');
				updates     = Array.isArray(updates) ? updates : [updates];
				
				// format the objects
				_.forEach(updates, function(u) {
					u.obj = {
						type: _.get(u, 'obj.attributes.type'),
						id: _.get(u, 'obj.$value')
					};
					
					// make the change set an array
					u.changeSet = Array.isArray(u.changeSet) ? u.changeSet : [u.changeSet];
					
					// update change set
					_.forEach(u.changeSet, function(c) {
						c.val = _.get(c, 'val.$value');
					});
				});
				
				// emit the results
				_client.emit('updates', updates);
			}
		});
	}
	
	
	
	/**
	 * emit updates for specified properties
	 * 
	 * @param {Object} args - Arguments hash
	 * @param {string} args.type - Type of object to retrieve
	 * @param {(string|string[])} [args.id] - id or array of ids to search for
	 * @param {ManagedObjectReference} [args.container=rootFolder] - Container to start search from
	 * @param {boolean} [recursive=true] - Recursive search
	 * @param {string|string[]} [properties] - Array of properties to retrieve. If string value of all, all properties will be retrieved
	 * @param {Object} [options] - Options Hash
	 * @param {number} [options.interval=60000] - Time in milliseconds between update checks. Must be one minute or more
	 */
	return function(args, options) {
		
		// make args an array
		args    = Array.isArray(args) ? args : [args];
		options = options || {};
		
		// default the interval to 2 minutes
		options.interval = !isNaN(options.interval) ? options.interval : minInterval;
		options.interval = (options.interval < minInterval) ? minInterval : options.interval;
		
		// create a views list
		var views = [];
		
		// check for an existing updates collector
		if (_.has(_client, '_updatesCollector')) {
			throw {
				errorCode: 400,
				message: 'Only one updates collector per client is allowed'
			};
		}
		
		// get a new propertySpec
		return _client.propertySpec(args).then(function(specSet) {
			
			// create a new property collector
			return _client.method('CreatePropertyCollector', {
				_this: _client._sc.propertyCollector
			})
			.then(function(collector) {
				
				// store the collector
				_client._updatesCollector = collector;
				_client._updatesVersion   = '';
				
				// create the filter
				return _client.method('CreateFilter', {
					_this: _client._updatesCollector,
					spec: specSet,
					partialUpdates: false
				})
				.then(function(filter) {

					// start an interval
					_client.updatesInterval = setInterval(getUpdates, options.interval);
				});
			});
		});
	};
};