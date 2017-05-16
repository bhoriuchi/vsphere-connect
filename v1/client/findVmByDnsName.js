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
	
	// find vm by dns
	return function(name) {
		return _client.findAllByDnsName({
			dnsName: name,
			vmSearch: true
		});
	};
};