/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env) {
	
	var _         = env.lodash;
	var util      = env.util;
	var nodexml   = env.nodexml;
	var _client   = env._client;
	var STATUS    = env.statics.status;

	/**
	 * error handler
	 */
	return function(err, method, args, resolve, reject) {

		var msg, envelope, body, fault, detail;

		// attempt to parse the SOAP error
		try {
			msg      = nodexml.xml2obj(err.body);
			envelope = _.get(msg, 'soapenv:Envelope');
			body     = _.get(envelope, 'soapenv:Body');
			fault    = _.get(body, 'soapenv:Fault');
			detail   = _.get(fault, 'detail');
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
				message: fault.faultstring || 'Not Found'
			});
		}
		
		// invalid login
		else if (_.has(detail, 'InvalidLoginFault')) {
			reject({
				code: 401,
				message: fault.faultstring || 'Invalid login credentials'
			});
		}
		
		// invalid request
		else if (_.has(detail, 'InvalidRequestFault')) {
			reject({
				code: 400,
				message: fault.faultstring || 'Your request was not formatted correctly'
			});
		}
		
		// not authenticated
		else if (_.has(detail, 'NotAuthenticatedFault')) {
			
			// clear the emitEvents interval if one exists
			if (_.has(_client, 'events._interval')) {
				
				var log = [];
				util.log(log, 'Not authenticated, clearning interval and exiting');
				
				try {
					clearInterval(_client.events._interval);
					util.log(log, 'Interval cleared');
					
				} catch(err) {}
				
				// emit the final log, RIP log.
				_client.emit('emitlog', log);
			}
			
			// emit a logout event
			_client.emit('logout', [_client.sessionId]);
			
			
			if (_client.retry < _client.maxRetry) {
				
				// set reconnecting status
				_client.status = STATUS.RECONNECTING;
				
				// increment the retry and attempt another login
				_client.retry++;
				_client.logIn().then(function() {
					_client.method(method, args, resolve, reject);
				});
			}
			else {
				
				// set disconnected status
				_client.status = STATUS.DISCONNECTED;
				
				// reject the promise
				reject({
					code: 401,
					message: fault.faultstring || 'Not Authorized'
				});
			}
		}
		
		// invalid property
		else if (_.has(detail, 'InvalidPropertyFault')) {
			reject({
				code: 400,
				message: fault.faultstring || detail.InvalidPropertyFault.name + ' is an invalid property'
			});
		}
		
		// unhandled faults
		else if (fault) {
			reject({
				code: 500,
				message: fault.faultstring || 'Unknown fault'
			});
		}
		// catch all
		else {
			_client.status = STATUS.DISCONNECTED;
			reject(err, method, args);
		}
	};
};