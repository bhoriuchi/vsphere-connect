/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	var _         = env.lodash;
	var nodexml   = env.nodexml;
	var _self     = env._self;
	var STATUS    = env.statics.status;

	/**
	 * error handler
	 */
	return function(err, method, args, resolve, reject) {

		var body, detail;

		// attempt to parse the SOAP error
		try {
			body   = nodexml.xml2obj(err.body);
			detail = _.get(body, 'soapenv:Envelope.soapenv:Body.soapenv:Fault.detail');	
		} catch(err) {}
		
		// the endpoint is not valid or its webservice is not started
		if (err.code === 'ENOTFOUND') {
			reject({
				code: 400,
				message: err.hostname + ' is not accessible on the network or is not a valid endpoint'
			});
		}
		
		// SSL error
		else if (err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
			reject({
				code: 403,
				message: 'You are attempting to connect to an endpoint using an untrusted SSL certificate. Use the ignoressl=true option to disable security checks'
			});
		}
		
		// Object not found
		else if (_.has(detail, 'ManagedObjectNotFoundFault')) {
			reject({
				code: 404,
				message: 'Not Found'
			});
		}
		
		// not authenticated
		else if (_.has(detail, 'NotAuthenticatedFault')) {
			
			_self.status = STATUS.DISCONNECTED;
			
			if (_self.retry < _self.maxRetry) {
				_self.retry++;
				_self.logIn().then(function() {
					_self.method(method, args, resolve, reject);
				});
			}
			else {
				reject({
					code: 401,
					message: 'Not Authorized'
				});
			}
		}
		
		// catch all
		else {
			_self.status = STATUS.DISCONNECTED;
			reject(err, method, args);
		}
	};
};