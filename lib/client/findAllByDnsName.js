/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	// modules
	var _         = env.lodash;
	
	// pointer to client object
	var _client     = env._client;
	
	// constants
	var STATUS    = env.statics.status;
	
	// find by dns name
	return function(args) {
		return _client.getServiceContent({
			method: 'FindAllByDnsName',
			service: 'searchIndex',
			params: {
				dnsName: args.dnsName,
				vmSearch: args.vmSearch
			}
		})
		.then(function(result) {
			return _.map(result, '$value');
		});
	};
};