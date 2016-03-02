/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env, c) {
	
	// modules
	var _         = env.lodash;
	var Promise   = env.promise;
	var util      = env.util;
	
	// pointer to client object
	var _client     = c._client;
	
	// constants
	var STATUS    = env.statics.status;
	
	
	// search the top level folders in each datacenter
	function rootSearch(args) {
		
		// get the datacenters
		return _client.retrieve({
			type: 'Datacenter',
			properties: ['name', 'datastoreFolder', 'hostFolder', 'networkFolder', 'vmFolder']
		})
		.then(function(dcs) {

			// look through each of the dcs and map the return values
			return Promise.map(dcs, function(dc) {
				
				var folderId;
				
				// get the correct folder id to start search from or if searching
				if (args.type === 'Datastore') {
					folderId = dc.datastoreFolder;
				}
				else if (args.type === 'HostSystem') {
					folderId = dc.hostFolder;
				}
				else if (args.type === 'Network') {
					folderId = dc.networkFolder;
				}
				else if (args.type === 'VirtualMachine') {
					folderId = dc.vmFolder;
				}
				
				// return the entity details
				return {
					type: 'Folder',
					id: folderId
				};
			});
		});
	}
	
	
	
	
	// recursive function to find matches
	function findByNameEx(args, matches) {

		// create a variable to store the matches
		matches = matches || [];
		
		// set option defaults
		args.name       = Array.isArray(args.name) ? args.name : [args.name];
		args.recursive  = (typeof(args.recursive) === 'boolean') ? args.recursive : false;
		args.limit      = !isNaN(args.limit) ? args.limit : 1;
		args.properties = args.properties || [];
		
		// check for a starting point, if one doesnt exist begin at the datacenter level
		if (!args.parent) {
			return rootSearch(args)
			.then(function(parents) {
				return findByNameEx({
					type       : args.type,
					name       : args.name,
					properties : args.properties,
					parent     : parents,
					recursive  : args.recursive,
					limit      : args.limit
				}, matches);
			});
		}
		
		// convert the parent to an array if it is not one
		args.parent = Array.isArray(args.parent) ? args.parent : [args.parent];
		
		// perform the search
		return Promise.each(args.parent, function(parent) {
			
			// check if the match limit is met
			if (matches.length >= args.limit) {
				return;
			}
			
			// perform the search on each name
			return Promise.each(args.name, function(name) {
				
				// check if the match limit is met
				if (matches.length >= args.limit) {
					return;
				}
				
				// perform the search
				return _client.getServiceContent({
					method: 'FindChild',
					service: 'searchIndex',
					params: {
						entity: util.moRef(parent.type, parent.id),
						name: name
					}
				})
				.then(function(result) {

					var id = _.get(result, '$value');
					
					if (id) {
						matches.push(id);
					}					
				});
			})
			.then(function() {
				
				// check if the match limit is met, if not and recursive
				// attempt to descend the child objects
				if (matches.length < args.limit && args.recursive) {
					
					// get the children of the current parent
					return _client.retrieve({
						type: parent.type,
						id: parent.id,
						properties: ['childEntity']
					})
					.then(function(mo) {

						var parents = [];
						
						// get all of the child folders
						_.forEach(_.get(mo, '[0].childEntity'), function(child) {
							if (child.match(/^group-.*/)) {
								parents.push({
									type: 'Folder',
									id: child
								});
							}
						});
						
						// if there were folders, recurse
						if (parents.length > 0) {
							return findByNameEx({
								type       : args.type,
								name       : args.name,
								properties : args.properties,
								parent     : parents,
								recursive  : args.recursive,
								limit      : args.limit
							}, matches);
						}
					});
				}
			});
		})
		.then(function() {
			return matches;
		});
	}
	
	
	/**
	 * finds entities by name
	 * @param {Object} args - Arguments hash
	 * @param {string} args.type - Type of entity to search for
	 * @param {(string|string[])} args.name - Name or names to search for
	 * @param {(Object|Object[])} [args.parent] - Parent entity or array of parent enties to search from
	 * @param {string} [args.parent.type] - Parent type
	 * @param {string} [args.parent.id] - Parent id
	 * @param {boolean} [recursive=false] - Recursively search the parent
	 * @param {number} [limit=1] - Limit results
	 */
	function findByName(args) {
		
		// validate the types
		if (!args.type || !_.includes(['Datastore', 'HostSystem', 'Network', 'VirtualMachine'], args.type)) {
			return new Promise(function(resolve, reject) {
				reject({
					errorCode: 400,
					message: 'Invalid search type. Valid types are Datastore, HostSystem, Network, and VirtualMachine'
				});
			});
		}
		
		// start the search
		return findByNameEx(args).then(function(matches) {

			// if no matches return an empty array
			if (!matches || (Array.isArray(matches) && matches.length === 0)) {
				return [];
			}
			
			// check for an ID only response and format the matches as an array of objects
			else if (Array.isArray(args.properties) && (args.properties.length === 0 || args.properties[0] === 'id')) {
				return _.map(matches, function(id) {
					return {id: id};
				});
			}
			
			// otherwise add get the items with their properties
			return _client.retrieve({
				type: args.type,
				id: matches,
				properties: args.properties
			});
		});
	}
	
	
	// return the main function
	return findByName;
};