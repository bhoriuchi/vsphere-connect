/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	var _ = env.lodash;
	
	// compose or decompose a moRef
	function moRef(type, id) {
		
		if (type && id) {
			return {
				attributes: {
					type: type
				},
				"$value": id
			};
		}
		else if (typeof(type) === 'object') {
			return {
				id: _.get(type, '$value'),
				type: _.get(type, 'attributes.type') || _.get(type, 'attributes.xsi:type')
			};
		}
		return null;
	}
	
	
	return {
		moRef: moRef
	};
};


