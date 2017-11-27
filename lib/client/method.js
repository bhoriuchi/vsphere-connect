/**
 * vSphere Connect
 * 
 * @author Branden Horiuchi <bhoriuchi@gmail.com>
 * @license MIT
 * 
 */
module.exports = function(env, c) {
	
	// modules
	var Promise   = env.promise;
	var _         = env.lodash;
	
	// pointer to client object
	var _client   = c._client;
	
	
	// recursive function to get the fields in the correct order based on the wsdl definitions
	function getFields(def, obj) {
		var a = {};
		
		// if not an object, return the value
		if (!_.isObject(obj)) {
			return obj;
		}
		
		// check for type override
		var defType = _.get(obj, 'attributes.xsi:type') || _.get(obj, 'attributes.type');
		defType     = defType ? defType.replace(/^vim25\:/i, '') : null;

		// if there is a type override and it is a valid type, set the def to that type
		// and add the type to the attributes
		if (defType && _.has(_client.types, defType)) {
			def = _client.types[defType]();
			a.attributes = {
				'xsi:type': defType
			};
		}
		
		// Adding this to handle the inherited types
		// Applies to only fields that are not in 'def'
		_.forEach(obj, function(v, k) {
			if (!_.has(def, k)) {
				if (Array.isArray(v)) {
					a[k] = _.map(v, function(o) {
						return getFields(v, o);
					});
				}	else if (_.isObject(v)) {
					a[k] = getFields(v, obj[k]);
				}	else {
					a[k] = v;
				}
			}
		});

		// loop through each field in the type definition and look for fields
		// that were supplied by the user
		_.forEach(def, function(v, k) {
			if (_.has(obj, k)) {
				if (Array.isArray(obj[k])) {
					a[k] = _.map(obj[k], function(o) {
						return getFields(v, o);
					});
				}
				else if (_.isObject(v) && _.isObject(obj[k])) {
					a[k] = getFields(v, obj[k]);
				}
				else {
					a[k] = obj[k];
				}
			}
		});
		
		// return the new arguments object
		return a;
	}
	
	
	// function to correctly order the arguments
	// this is done because arguments in an incorrect
	// order will cause the soap method to fail
	function sortArgs(method, args) {

		// get the method definition
		var def = _.get(_client.types, method.replace(/\_Task$/i, '') + 'RequestType');
		
		// if found create the definition by calling its function
		if (def) {
			return getFields(def(), args);
		}
		return args;
	}
	
	
	// execute a method
	return function(name, args, resolve, reject) {

		// sort the args
		args = sortArgs(name, args);
		
		// executes the function
		var exec = function(resolve, reject) {
			var fn = _client.client.VimService.VimPort[name];
			fn(args, function(err, result, raw, soapHeader) {
				if (err) {
					
					// emit an error and handle the error
					_client.emit('method.error', err);
					_client.errorHandler(err, name, args, resolve, reject);
				}
				else {
					_client.retry = 0;
					
					// emit an event and resolve the output
					_client.emit('method.result', result);
					resolve(_.get(result, 'returnval'));
				}
			});
		};
		
		// attempt a new execution
		if (!resolve && !reject) {
			// create a new promise
			return new Promise(function(resolve, reject) {
				exec(resolve, reject);
			});
		}
		// if there is a resolve or reject this is a retry, attempt to retry
		else {
			exec(resolve, reject);
		}
	};
};