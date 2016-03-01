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
				errorCode: 400,
				message: err.hostname + ' is not accessible on the network or is not a valid endpoint'
			});
		}
		
		// SSL error
		else if (err.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE') {
			reject({
				errorCode: 403,
				message: 'You are attempting to connect to an endpoint using an untrusted SSL certificate. Use the ignoressl=true option to disable security checks'
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
					errorCode: 401,
					message: fault.faultstring || 'Not Authorized'
				});
			}
		}
		
		// invalid login
		else if (_.has(detail, 'InvalidLoginFault')) {
			reject({
				errorCode: 401,
				message: fault.faultstring || 'Invalid login credentials'
			});
		}
		
		// Object not found
		else if (_.has(detail, 'ManagedObjectNotFoundFault')) {
			reject({
				errorCode: 404,
				message: fault.faultstring || 'Not Found'
			});
		}
		
		// invalid request
		else if (detail && _.includes([
		    'InvalidRequestFault',
		    'InvalidPropertyFault',
		    'DuplicateNameFault'
		], _.keys(detail)[0])) {
			reject({
				errorCode: 400,
				message: fault.faultstring
			});
		}
		
		// unhandled faults
		else if (fault) {
			reject({
				errorCode: 500,
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