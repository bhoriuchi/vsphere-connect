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
	
	// pointer to client object
	var _client     = c._client;
	
	// constants
	var STATUS    = env.statics.status;
	
	// recursively looks for a parent type
	function getParent(type, id, parentType, root) {
		return _client.retrieve({
			type: type,
			id: id,
			properties: ['parent']
		})
		.then(function(obj) {
			
			if (obj.length > 0) {
				
				obj  = _.first(obj);
				type = _.get(obj, 'parent.type');
				id   = _.get(obj, 'parent.id');
				
				// if there is no parent type or id, the parent could not be found, throw an error
				if (!type || !id) {
					throw {
						errorCode: 404,
						message: 'could not find parent type'
					};
				}
				
				// if the parent is a match
				if (type === parentType) {
					
					// if a root search, keep looking for parent objects of the same type
					if (root === true) {
						return _client.retrieve({
							type: type,
							id: id,
							properties: ['parent']
						})
						.then(function(parent) {
							if (_.get(parent, 'parent.type') === parentType) {
								return getParent(type, id, parentType, root);
							}
							return {
								id: id,
								type: parentType
							};
						});
					}
					return {
						id: id,
						type: parentType
					};
				}
				
				return getParent(type, id, parentType, root);
			}
			
			throw {
				errorCode: 404,
				message: 'Object not found'
			};
		});
	}
	
	
	
	// find by dns name
	return function(args) {
		return getParent(args.type, args.id, args.parentType, args.root);
	};
};